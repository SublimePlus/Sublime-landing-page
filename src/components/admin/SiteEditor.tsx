"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { uploadImage } from "./image-upload";

/**
 * Form for the website copy in content/site.json.
 *
 * The form is generated from the content itself: text becomes an input or a
 * textarea, on/off values a checkbox, lists get add/remove/reorder controls,
 * and any field named `image` gets an upload button. New list items copy the
 * shape of the first item with blank values, which keeps every edit inside the
 * shape the server-side validator accepts.
 */

type Json = string | boolean | Json[] | { [key: string]: Json };

const SECTION_TITLES: Record<string, string> = {
  hero: "Top banner",
  services: "Services",
  ugc: "Visual content (UGC)",
  howItWorks: "How it works",
  plans: "Plans & prices",
  faq: "FAQ",
  finalCta: "Final call to action",
  footer: "Footer",
};

const LABELS: Record<string, string> = {
  headlineLine1: "Headline, line 1",
  headlineLine2: "Headline, line 2 (highlighted)",
  primaryButton: "Main button",
  secondaryButton: "Second button",
  footnote: "Small text under the buttons",
  eyebrow: "Small label above the heading",
  intro: "Intro text",
  items: "Items",
  steps: "Steps",
  blurb: "Short description",
  image: "Image",
  price: "Price (leave empty to hide)",
  highlighted: "Highlight this plan",
  highlightBadge: "Badge on the highlighted plan",
  deliverables: "What's included",
  compareHeading: "Comparison table: first column title",
  compareRows: "Comparison table rows",
  values: "Values (one per plan, in order)",
  compareNote: "Note under the table",
  addonsHeading: "Add-ons box: heading",
  addonsText: "Add-ons box: text",
  addonsButton: "Add-ons box: button",
  button: "Button text",
  marquee: "Scrolling phrases",
  emails: "Email addresses",
};

const LONG_FIELDS = new Set(["subheading", "description", "intro", "answer", "text", "blurb"]);

const FIELD =
  "mt-1 w-full rounded-xl border border-pine/15 bg-white px-3 py-2 text-sm text-pine outline-none focus:border-teal dark:border-white/15 dark:bg-night/60 dark:text-white";
const SMALL_BUTTON =
  "rounded-full border border-pine/15 px-3 py-1 text-xs font-semibold text-pine hover:border-teal disabled:opacity-30 dark:border-white/15 dark:text-white";

function label(key: string) {
  if (LABELS[key]) return LABELS[key];
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** A blank copy of a value with the same shape, for new list items. */
function blank(value: Json): Json {
  if (typeof value === "string") return "";
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return value.map(blank);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)]));
}

/** A short name for a list item, from its first text field. */
function itemTitle(value: Json, index: number) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const first = Object.values(value).find((v) => typeof v === "string" && v.trim());
    if (typeof first === "string") return `${index + 1}. ${first.slice(0, 60)}`;
  }
  return `Item ${index + 1}`;
}

export function SiteEditor() {
  const [content, setContent] = useState<Record<string, Json> | null>(null);
  const [sha, setSha] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/site", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          content?: Record<string, Json>;
          sha?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !data.content) {
          setError(data.error ?? "Could not load the website content.");
          return;
        }
        setContent(data.content);
        setSha(data.sha);
      } catch {
        if (!cancelled) setError("Could not reach the server.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateSection(key: string, value: Json) {
    setContent((current) => (current ? { ...current, [key]: value } : current));
    setDirty(true);
    setNotice(null);
  }

  async function onSave() {
    if (!content) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sha }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      // Reload to pick up the new sha, so a second save does not conflict.
      const fresh = await fetch("/api/admin/site", { cache: "no-store" });
      const freshData = (await fresh.json().catch(() => ({}))) as { sha?: string };
      setSha(freshData.sha);
      setDirty(false);
      setNotice("Saved. The website updates once the deploy finishes, usually a minute or two.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !content) {
    return <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>;
  }
  if (!content) {
    return <p className="text-sm text-stone dark:text-white/60">Loading website content…</p>;
  }

  return (
    <div className="space-y-4 pb-24">
      {Object.entries(content).map(([key, value]) => (
        <details key={key} className="glass-panel rounded-2xl p-5" open={key === "hero"}>
          <summary className="cursor-pointer text-base font-semibold text-pine dark:text-white">
            {SECTION_TITLES[key] ?? label(key)}
          </summary>
          <div className="mt-4">
            <Field value={value} onChange={(next) => updateSection(key, next)} />
          </div>
        </details>
      ))}

      <div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-pine/10 bg-white/95 p-4 shadow-lg dark:border-white/10 dark:bg-night/95">
        <button
          onClick={() => void onSave()}
          disabled={saving || !dirty}
          className="neon-teal-btn rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal disabled:opacity-50 dark:bg-teal dark:hover:bg-teal-dark"
        >
          {saving ? "Saving…" : dirty ? "Save and publish" : "No changes"}
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-pine/15 px-5 py-2.5 text-sm font-semibold text-pine dark:border-white/15 dark:text-white"
        >
          Back
        </Link>
        {notice && <p className="text-sm text-pine dark:text-white">{notice}</p>}
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/** Renders one value; `name` is its key in the parent object, if any. */
function Field({
  value,
  onChange,
  name,
}: {
  value: Json;
  onChange: (next: Json) => void;
  name?: string;
}) {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm text-pine dark:text-white">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-teal"
        />
        {name ? label(name) : "On"}
      </label>
    );
  }

  if (typeof value === "string") {
    if (name === "image") return <ImageField value={value} onChange={onChange} />;
    const long = (name && LONG_FIELDS.has(name)) || value.length > 90;
    return long ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={FIELD}
      />
    ) : (
      <input value={value} onChange={(event) => onChange(event.target.value)} className={FIELD} />
    );
  }

  if (Array.isArray(value)) {
    return <ListField items={value} onChange={onChange} name={name} />;
  }

  return (
    <div className="space-y-3">
      {Object.entries(value).map(([key, child]) => (
        <div key={key}>
          {typeof child !== "boolean" && (
            <p className="text-xs font-semibold uppercase tracking-wide text-stone dark:text-white/50">
              {label(key)}
            </p>
          )}
          <Field
            name={key}
            value={child}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        </div>
      ))}
    </div>
  );
}

function ListField({
  items,
  onChange,
  name,
}: {
  items: Json[];
  onChange: (next: Json) => void;
  name?: string;
}) {
  const template = items[0];

  function move(index: number, by: -1 | 1) {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const controls = (
          // preventDefault keeps a click on these buttons from also opening or
          // closing the <details> they sit in.
          <div className="flex shrink-0 gap-1" onClick={(event) => event.preventDefault()}>
            <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className={SMALL_BUTTON} aria-label="Move up">
              ↑
            </button>
            <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className={SMALL_BUTTON} aria-label="Move down">
              ↓
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              disabled={items.length <= 1}
              className={`${SMALL_BUTTON} text-red-600 dark:text-red-400`}
              aria-label="Remove"
            >
              ✕
            </button>
          </div>
        );
        const update = (next: Json) => onChange(items.map((v, i) => (i === index ? next : v)));

        // Plain text items stay on one line; objects get their own box.
        return typeof item === "string" ? (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <Field value={item} onChange={update} name={name} />
            </div>
            <div className="pt-1">{controls}</div>
          </div>
        ) : (
          <details key={index} className="rounded-xl border border-pine/10 p-3 dark:border-white/10">
            <summary className="flex cursor-pointer items-center justify-between gap-2 text-sm font-medium text-pine dark:text-white">
              <span className="truncate">{itemTitle(item, index)}</span>
              {controls}
            </summary>
            <div className="mt-3">
              <Field value={item} onChange={update} />
            </div>
          </details>
        );
      })}
      {template !== undefined && (
        <button type="button" onClick={() => onChange([...items, blank(template)])} className={SMALL_BUTTON}>
          + Add
        </button>
      )}
    </div>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (next: Json) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const path = await uploadImage(file);
      setPreview(URL.createObjectURL(file));
      onChange(path);
    } catch (uploadError) {
      setError((uploadError as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-3">
      {(preview || value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview ?? value}
          alt=""
          className="h-16 w-24 rounded-lg border border-pine/15 object-cover dark:border-white/15"
        />
      )}
      <label className={`${SMALL_BUTTON} cursor-pointer px-4 py-1.5 text-sm`}>
        {uploading ? "Uploading…" : "Replace image"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </label>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
