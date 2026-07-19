const MAX_DIMENSION = 1280;
const SKIP_BELOW_BYTES = 600 * 1024;

// Some browsers (older Safari) cannot encode WebP and silently fall back to
// PNG; verify the produced type and reject mismatches so the JPEG path runs.
function encodeCanvas(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob && blob.type === type ? blob : null), type, quality);
  });
}

// Downscales and recompresses large applicant photos/receipts in the browser
// so a multi-megabyte phone picture uploads as a few hundred kilobytes.
// Prefers WebP (smaller, and much kinder to text in receipt screenshots),
// falls back to JPEG, and keeps the original on any failure; the server still
// enforces the hard cap.
export async function optimizeApplicationPhoto(file: File): Promise<File> {
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = (await encodeCanvas(canvas, "image/webp", 0.8)) ?? (await encodeCanvas(canvas, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "applicant-photo";
    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  } catch {
    return file;
  }
}
