"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  Smile,
  ImagePlus,
  Trash2,
  Tag,
  X,
  Check,
  Heart,
} from "lucide-react";

/* ---------- helpers ---------- */

function getEntryById(id) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("diary_entries");
  if (!raw) return null;
  const entries = JSON.parse(raw);
  return entries.find((e) => e.id === id) || null;
}

function saveEntry(updated) {
  const raw = localStorage.getItem("diary_entries");
  if (!raw) return;
  const entries = JSON.parse(raw).map((e) =>
    e.id === updated.id ? updated : e
  );
  localStorage.setItem("diary_entries", JSON.stringify(entries));
}

/* ---------- page ---------- */

export default function ViewEntryPage() {
  const { id } = useParams();
  const router = useRouter();

  // ✅ derive ONCE (no useEffect)
  const [draft, setDraft] = useState(() => getEntryById(id));
  const [isEditing, setIsEditing] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  if (!draft) {
    router.push("/my-diaries");
    return null;
  }

  /* ---------- image upload ---------- */

  const readImage = (file) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    setUploadError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if ((draft.images?.length || 0) + files.length > 5) {
      setUploadError("Maximum 5 images allowed");
      return;
    }

    const images = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        data: await readImage(file),
      }))
    );

    setDraft({
      ...draft,
      images: [...(draft.images || []), ...images],
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id) => {
    setDraft({
      ...draft,
      images: draft.images.filter((img) => img.id !== id),
    });
  };

  /* ---------- tags ---------- */

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || draft.tags?.includes(t)) return;
    setDraft({ ...draft, tags: [...(draft.tags || []), t] });
    setTagInput("");
  };

  const removeTag = (t) => {
    setDraft({ ...draft, tags: draft.tags.filter((x) => x !== t) });
  };

  /* ---------- save ---------- */

  const handleSave = () => {
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    saveEntry(updated);
    setDraft(updated);
    setIsEditing(false);
  };

  /* ---------- moods ---------- */

  const moods = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "sad", emoji: "😢", label: "Sad" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "excited", emoji: "🎉", label: "Excited" },
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between">
          <button className="cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft />
          </button>

          <button className="cursor-pointer" onClick={isEditing ? handleSave : () => setIsEditing(true)}>
            {isEditing ? <Check /> : "Edit"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* TITLE */}
        {isEditing ? (
          <input
            className="w-full text-4xl font-bold bg-transparent outline-none"
            value={draft.title}
            onChange={(e) =>
              setDraft({ ...draft, title: e.target.value })
            }
          />
        ) : (
          <h1 className="text-4xl font-bold">{draft.title}</h1>
        )}

        {/* MOOD */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-5 h-5" />
            <span>Mood</span>
          </div>

          {isEditing ? (
            <div className="flex gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setDraft({ ...draft, mood: m.value })}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          ) : (
            <span>
              {moods.find((m) => m.value === draft.mood)?.emoji}{" "}
              {moods.find((m) => m.value === draft.mood)?.label}
            </span>
          )}
        </section>

        {/* PHOTOS (INLINE, SAME AS CREATE) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <ImagePlus className="w-5 h-5" />
              <span>Photos ({draft.images?.length || 0}/5)</span>
            </div>

            {isEditing && (
              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
                Upload Image
              </label>
            )}
          </div>

          {uploadError && (
            <p style={{ color: "var(--color-error)" }}>{uploadError}</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(draft.images || []).map((img) => (
              <div key={img.id} className="relative">
                <img src={img.data} alt="" className="rounded-lg" />
                {isEditing && (
                  <button
                    className="absolute top-2 right-2"
                    onClick={() => removeImage(img.id)}
                  >
                    <Trash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CONTENT */}
        {isEditing ? (
          <textarea
            className="w-full bg-transparent outline-none"
            rows={8}
            value={draft.content}
            onChange={(e) =>
              setDraft({ ...draft, content: e.target.value })
            }
          />
        ) : (
          <div className="whitespace-pre-wrap">{draft.content}</div>
        )}

        {/* TAGS (INLINE, SAME AS CREATE) */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-5 h-5" />
            <span>Tags</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {(draft.tags || []).map((t) => (
              <span key={t} className="flex items-center gap-1">
                {t}
                {isEditing && (
                  <button onClick={() => removeTag(t)}>
                    <X />
                  </button>
                )}
              </span>
            ))}
          </div>

          {isEditing && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Add tag..."
            />
          )}
        </section>
      </main>
    </div>
  );
}
