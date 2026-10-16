"use client";

import { useRef, useState, type FormEvent } from "react";
import { FiCamera, FiCheckCircle, FiSmartphone, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_CUSTOMER_NAME, formatPhone, type User } from "@/lib/auth";
import Avatar from "./Avatar";

const AVATAR_PX = 320;

// Centre-crops the chosen photo to a small square JPEG so uploads stay tiny on any phone camera.
async function toAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_PX, AVATAR_PX);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function ProfileInfoForm({ user }: { user: User }) {
  const { updateName, updateAvatar } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [saved, setSaved] = useState(false);
  const isDefaultName = user.name === DEFAULT_CUSTOMER_NAME;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter a name with at least 2 characters.");
    setBusy(true);
    const result = await updateName(name);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setSaved(true);
  }

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setPhotoError("");
    if (!file.type.startsWith("image/")) return setPhotoError("Please choose an image file.");
    setPhotoBusy(true);
    try {
      const result = await updateAvatar(await toAvatarDataUrl(file));
      if (!result.ok) setPhotoError(result.error);
    } catch {
      setPhotoError("We couldn't read that image. Please try a JPG or PNG photo.");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removePhoto() {
    setPhotoError("");
    setPhotoBusy(true);
    const result = await updateAvatar(null);
    setPhotoBusy(false);
    if (!result.ok) setPhotoError(result.error);
  }

  return (
    <div className="rounded-2xl border border-rose-light/60 bg-white p-6 shadow-sm md:p-8">
      <h3 className="font-serif-display text-xl font-bold text-plum">Profile Information</h3>
      <p className="mt-1 text-sm text-ink/50">Your name and photo are only shown to you and used on your orders.</p>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative">
          <Avatar user={user} className={`h-24 w-24 text-4xl ring-4 ring-rose-light/60 ${photoBusy ? "opacity-50" : ""}`} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            aria-label={user.avatarUrl ? "Change profile photo" : "Upload profile photo"}
            className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-plum text-white shadow-md transition-transform hover:scale-110 disabled:opacity-60"
          >
            <FiCamera />
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="rounded-full border border-plum/15 px-4 py-2 text-sm font-semibold text-plum transition-colors hover:border-rose-dark hover:text-rose-dark disabled:opacity-60"
            >
              {photoBusy ? "Saving…" : user.avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={removePhoto}
                disabled={photoBusy}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-ink/55 hover:text-rose-dark disabled:opacity-60"
              >
                <FiTrash2 /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink/45">JPG, PNG or WebP. We&apos;ll crop it to a square.</p>
          {photoError && <p role="alert" className="text-sm font-medium text-rose-dark">{photoError}</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Your name
          </label>
          <input
            id="profile-name"
            required
            type="text"
            autoComplete="name"
            maxLength={60}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-2.5 text-base text-ink outline-none transition-colors focus:border-rose-dark sm:text-sm"
          />
          {isDefaultName && !saved && (
            <p className="mt-1.5 text-xs text-ink/50">&ldquo;{DEFAULT_CUSTOMER_NAME}&rdquo; is the name we gave you. Change it to your own.</p>
          )}
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Mobile number</span>
          <p className="flex items-center gap-2 rounded-lg border border-plum/10 bg-cream/20 px-4 py-2.5 text-sm font-semibold text-ink/70">
            <FiSmartphone className="text-rose-dark" /> {formatPhone(user.phone)}
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600">
              <FiCheckCircle /> Verified
            </span>
          </p>
          <p className="mt-1.5 text-xs text-ink/45">This is the number you log in with.</p>
        </div>

        {error && <p role="alert" className="text-sm font-medium text-rose-dark">{error}</p>}
        {saved && !error && (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <FiCheckCircle /> Name saved.
          </p>
        )}

        <button
          type="submit"
          disabled={busy || name.trim() === user.name}
          className="mt-2 self-start rounded-full bg-rose px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
        >
          {busy ? "Saving…" : "Save name"}
        </button>
      </form>
    </div>
  );
}
