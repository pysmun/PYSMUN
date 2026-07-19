"use client";

import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { useRef, useState } from "react";
import { filePreviewUrl } from "@/lib/file-preview";
import { optimizeApplicationPhoto } from "@/lib/optimize-photo";

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

type ApplicationPhotoFieldProps = {
  file: File | null;
  error?: string[];
  onChange: (file: File | null) => void;
  onError: (message?: string) => void;
  wide?: boolean;
  label?: string;
  prompt?: string;
  note?: string;
  requiredMessage?: string;
};

export function ApplicationPhotoField({
  file,
  error,
  onChange,
  onError,
  wide,
  label = "Applicant photo",
  prompt = "Choose a clear, front-facing photo",
  note = "Stored privately and used only to identify your application.",
  requiredMessage = "Applicant photo is required",
}: ApplicationPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [optimizing, setOptimizing] = useState(false);
  const preview = filePreviewUrl(file);

  function reject(message: string) {
    if (inputRef.current) inputRef.current.value = "";
    onChange(null);
    onError(message);
  }

  async function choose(nextFile?: File) {
    if (!nextFile) return;
    if (!acceptedTypes.has(nextFile.type)) {
      reject("Use a JPEG, PNG or WebP image");
      return;
    }
    if (nextFile.size > MAX_INPUT_BYTES) {
      reject("Please choose a photo under 30 MB");
      return;
    }

    setOptimizing(true);
    try {
      const optimized = await optimizeApplicationPhoto(nextFile);
      if (optimized.size > MAX_BYTES) {
        reject("This photo could not be reduced below 2 MB. Please choose another.");
        return;
      }
      onError();
      onChange(optimized);
    } finally {
      setOptimizing(false);
    }
  }

  return (
    <div className={wide ? "field field--wide application-photo-field" : "field application-photo-field"}>
      <span>{label}</span>
      <div className={error?.length ? "photo-picker photo-picker--error" : "photo-picker"}>
        <label className="photo-picker__select">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => choose(event.target.files?.[0])} />
          {preview ? <img src={preview} alt="Selected image" /> : <span className="photo-picker__icon">{optimizing ? <LoaderCircle className="spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}</span>}
          <span className="photo-picker__copy">
            <strong>{optimizing ? "Optimizing photo…" : file ? file.name : prompt}</strong>
            <small>{optimizing ? "One moment" : file ? `${formatSize(file.size)} · Click to replace` : "JPEG, PNG or WebP · Large photos are optimized automatically"}</small>
          </span>
        </label>
        {file && <button type="button" className="photo-picker__remove" onClick={() => { if (inputRef.current) inputRef.current.value = ""; onChange(null); onError(requiredMessage); }} aria-label="Remove selected image"><X aria-hidden="true" /></button>}
      </div>
      <small>{error?.[0] || note}</small>
    </div>
  );
}
