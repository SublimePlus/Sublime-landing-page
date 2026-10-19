"use client";

/**
 * Turns uploaded files into draft posts for the schedule page.
 *
 *   .md / .txt — one post, or several when the file has more than one "# " title.
 *                Under each title, optional "Key: value" lines set that post's
 *                Date, Time, Author, Excerpt, Image (a link) and Image prompt.
 *                Frontmatter (same keys) applies to every post in the file.
 *   .docx      — same as Markdown, with Word's Title or Heading 1 style for each
 *                post title; headings, bold, italics, links and lists survive.
 *   .csv       — one post per row. Columns (any order, any case): title, excerpt,
 *                body, date, time, author, image, image_prompt.
 *
 * Nothing here talks to the server; the drafts are shown for checking first.
 */

export type DraftPost = {
  key: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  imagePrompt: string;
  /** An image URL from the file; the scheduler downloads it. */
  imageUrl: string;
  /** Local "YYYY-MM-DDTHH:mm" for the datetime input, or "" when not given. */
  when: string;
  source: string;
};

let counter = 0;
const nextKey = () => `draft-${Date.now()}-${counter++}`;

// ---------------------------------------------------------------- dates

const pad = (n: number) => String(n).padStart(2, "0");

/** A Date as the value a `datetime-local` input expects, in local time. */
export function toLocalInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

/**
 * Reads a date and an optional time as the admin's local time. Accepts
 * 2026-10-20, 20/10/2026 (day first), 20-10-2026, "Oct 20 2026", and times like
 * 09:00, 9am or 9:30 PM. A date with no time goes out at 09:00.
 */
export function parseWhen(dateText: string, timeText = ""): string {
  const raw = `${dateText} ${timeText}`.trim();
  if (!raw) return "";

  let year: number, month: number, day: number;
  let rest = raw;
  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]+|$)/.exec(raw);
  if (match) {
    [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    rest = raw.slice(match[0].length);
  } else if ((match = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s]+|$)/.exec(raw))) {
    [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
    // 10/20/2026 cannot be day-first, so read it month-first.
    if (month > 12 && day <= 12) [day, month] = [month, day];
    rest = raw.slice(match[0].length);
  } else {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? "" : toLocalInput(parsed);
  }

  let hours = 9;
  let minutes = 0;
  const time = /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm)?/i.exec(rest.trim());
  if (time) {
    hours = Number(time[1]);
    minutes = Number(time[2] ?? 0);
    const meridiem = time[3]?.toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
  }

  const date = new Date(year, month - 1, day, hours, minutes);
  if (Number.isNaN(date.getTime()) || date.getMonth() !== month - 1) return "";
  return toLocalInput(date);
}

// ---------------------------------------------------------------- text helpers

/** First paragraph as plain text, cut at a word near 160 characters. */
export function makeExcerpt(markdown: string) {
  const paragraph =
    markdown
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|!\[|[-*+]\s|\d+\.\s|>|```)/.test(block)) ?? "";
  const text = paragraph
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 157).replace(/\s+\S*$/, "")}…`;
}

function titleFromFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function readFrontmatter(text: string) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {} as Record<string, string>, content: text };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (pair) data[pair[1].toLowerCase().replace(/[-_]/g, "")] = pair[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, content: text.slice(match[0].length) };
}

function draft(fields: Partial<DraftPost> & { body: string; source: string }): DraftPost {
  const body = fields.body.replace(/\r\n/g, "\n").trim();
  return {
    key: nextKey(),
    title: fields.title?.trim() ?? "",
    excerpt: fields.excerpt?.trim() || makeExcerpt(body),
    body,
    author: fields.author?.trim() ?? "",
    imagePrompt: fields.imagePrompt?.trim() ?? "",
    imageUrl: /^https?:\/\//.test(fields.imageUrl ?? "") ? fields.imageUrl!.trim() : "",
    when: fields.when ?? "",
    source: fields.source,
  };
}

// ---------------------------------------------------------------- markdown

const META_KEYS: Record<string, keyof PostMeta> = {
  date: "date",
  day: "date",
  publish: "date",
  "publish date": "date",
  "publish at": "date",
  "publish on": "date",
  time: "time",
  "publish time": "time",
  author: "author",
  by: "author",
  excerpt: "excerpt",
  summary: "excerpt",
  description: "excerpt",
  "meta description": "excerpt",
  image: "image",
  cover: "image",
  "image url": "image",
  "cover image": "image",
  "image prompt": "imagePrompt",
  prompt: "imagePrompt",
};

type PostMeta = {
  date: string;
  time: string;
  author: string;
  excerpt: string;
  image: string;
  imagePrompt: string;
};

/**
 * Reads the "Key: value" lines right under a post's title (Date, Time, Author,
 * Excerpt, Image, Image prompt) and returns them with the rest of the text.
 * Blank lines between them are fine; the first other line starts the body.
 */
function readMetaLines(text: string): { meta: Partial<PostMeta>; body: string } {
  const lines = text.split("\n");
  const meta: Partial<PostMeta> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Word bolds the labels sometimes: "**Date:** 1 Nov".
    const match = /^([A-Za-z][A-Za-z ]{0,20}?)\s*:\s*(.+)$/.exec(line.replace(/\*\*/g, ""));
    const key = match && META_KEYS[match[1].trim().toLowerCase()];
    if (!match || !key) break;
    let value = match[2].trim();
    // A link pasted into Word arrives as [text](url).
    const link = /\]\((https?:[^)]+)\)/.exec(value);
    if (link) value = link[1];
    meta[key] = value;
  }
  return { meta, body: lines.slice(i).join("\n") };
}

export function postsFromMarkdown(text: string, fileName: string): DraftPost[] {
  const { data, content } = readFrontmatter(text.replace(/^\uFEFF/, ""));

  /** Builds one post; values under its title win over the file's frontmatter. */
  const make = (title: string, rawBody: string) => {
    const { meta, body } = readMetaLines(rawBody);
    const date = meta.date || data.publishat || data.date || "";
    const time = meta.time || (data.publishat && !meta.date ? "" : data.time || "");
    return draft({
      title,
      excerpt: meta.excerpt || data.excerpt || data.description || data.summary,
      body,
      author: meta.author || data.author,
      imagePrompt: meta.imagePrompt || data.imageprompt,
      imageUrl: meta.image || data.image || data.cover || data.imageurl,
      when: parseWhen(date, time),
      source: fileName,
    });
  };

  // Several "# Title" headings means several posts in one file.
  const titled = content.split(/^(?=# (?!#))/m).filter((part) => /^# /.test(part));
  if (titled.length > 1) {
    return titled.map((part) => {
      const [first, ...rest] = part.split("\n");
      return make(first.replace(/^#\s+/, "").trim(), rest.join("\n"));
    });
  }

  let body = content;
  let title = data.title ?? "";
  const heading = /^\s*# (.+)\n/.exec(body);
  if (heading) {
    title ||= heading[1];
    body = body.slice(heading[0].length);
  }
  return [make(title || titleFromFileName(fileName), body)];
}

// ---------------------------------------------------------------- docx

/** Converts the HTML mammoth produces into Markdown the blog renders. */
function htmlToMarkdown(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const inline = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    const inner = Array.from(node.childNodes).map(inline).join("");
    switch (node.tagName) {
      case "STRONG":
      case "B":
        return inner.trim() ? `**${inner}**` : inner;
      case "EM":
      case "I":
        return inner.trim() ? `*${inner}*` : inner;
      case "A": {
        const href = node.getAttribute("href") ?? "";
        return /^https?:|^mailto:|^\//.test(href) ? `[${inner}](${href})` : inner;
      }
      case "BR":
        return "\n";
      case "IMG":
        return "";
      default:
        return inner;
    }
  };

  const blocks: string[] = [];
  const block = (node: Element) => {
    const tag = node.tagName;
    if (/^H[1-6]$/.test(tag)) {
      const text = inline(node).trim();
      if (text) blocks.push(`${"#".repeat(Number(tag[1]))} ${text.replace(/\*\*/g, "")}`);
    } else if (tag === "UL" || tag === "OL") {
      const items = Array.from(node.children).filter((child) => child.tagName === "LI");
      blocks.push(
        items
          .map((item, i) => `${tag === "OL" ? `${i + 1}.` : "-"} ${inline(item).trim()}`)
          .join("\n")
      );
    } else if (tag === "TABLE") {
      // Tables flatten to one paragraph per row.
      for (const row of Array.from(node.querySelectorAll("tr"))) {
        const cells = Array.from(row.children).map((cell) => inline(cell).trim()).filter(Boolean);
        if (cells.length) blocks.push(cells.join(" | "));
      }
    } else {
      const text = inline(node).trim();
      if (text) blocks.push(text);
    }
  };
  Array.from(doc.body.children).forEach(block);
  return blocks.join("\n\n");
}

async function postsFromDocx(file: File) {
  const { default: mammoth } = await import("mammoth/mammoth.browser");
  const result = await mammoth.convertToHtml(
    { arrayBuffer: await file.arrayBuffer() },
    { styleMap: ["p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh"] }
  );
  return postsFromMarkdown(htmlToMarkdown(result.value), file.name);
}

// ---------------------------------------------------------------- csv

/** RFC 4180 CSV: quoted fields may hold commas, quotes ("") and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^﻿/, "");
  // Excel in many locales writes ";" as the separator.
  const firstLine = input.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === sep) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((value) => value.trim()));
}

const COLUMN_ALIASES: Record<string, string[]> = {
  title: ["title", "headline", "name"],
  excerpt: ["excerpt", "summary", "description", "metadescription"],
  body: ["body", "content", "text", "post", "article", "markdown"],
  date: ["date", "publishdate", "day", "publishat", "publishon", "datetime", "schedule"],
  time: ["time", "publishtime", "hour"],
  author: ["author", "byline", "writer"],
  image: ["image", "imageurl", "cover", "coverurl", "photo"],
  imagePrompt: ["imageprompt", "prompt"],
};

export function postsFromCsv(text: string, fileName: string): DraftPost[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const normalized = header.map((name) => name.toLowerCase().replace(/[^a-z]/g, ""));
  const column = (key: string) =>
    normalized.findIndex((name) => COLUMN_ALIASES[key].includes(name));
  const index = Object.fromEntries(Object.keys(COLUMN_ALIASES).map((key) => [key, column(key)]));
  if (index.title < 0 || index.body < 0) {
    throw new Error(`${fileName}: the CSV needs at least a "title" and a "body" column.`);
  }
  const get = (row: string[], key: string) => (index[key] >= 0 ? (row[index[key]] ?? "").trim() : "");

  return rows
    .filter((row) => get(row, "title") && get(row, "body"))
    .map((row, i) =>
      draft({
        title: get(row, "title"),
        excerpt: get(row, "excerpt"),
        body: get(row, "body").replace(/\\n/g, "\n"),
        author: get(row, "author"),
        imageUrl: get(row, "image"),
        imagePrompt: get(row, "imagePrompt"),
        when: parseWhen(get(row, "date"), get(row, "time")),
        source: `${fileName}, row ${i + 2}`,
      })
    );
}

// ---------------------------------------------------------------- entry point

export async function postsFromFile(file: File): Promise<DraftPost[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) return postsFromCsv(await file.text(), file.name);
  if (name.endsWith(".docx")) return postsFromDocx(file);
  if (name.endsWith(".doc")) {
    throw new Error(`${file.name}: old .doc files can't be read. Save it as .docx and try again.`);
  }
  if (/\.(md|markdown|txt)$/.test(name)) return postsFromMarkdown(await file.text(), file.name);
  throw new Error(`${file.name}: use a .md, .txt, .docx or .csv file.`);
}
