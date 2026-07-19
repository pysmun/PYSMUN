// One object URL per File for the lifetime of the page. Nothing is revoked on
// unmount, so previews survive step changes and StrictMode's re-run of effect
// cleanups; the handful of URLs a form session creates is negligible memory.
const objectUrlCache = new WeakMap<File, string>();

export function filePreviewUrl(file: File | null) {
  if (!file) return "";
  let url = objectUrlCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    objectUrlCache.set(file, url);
  }
  return url;
}
