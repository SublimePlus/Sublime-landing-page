import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
  duotone: "teal" | "pine";
  readingTime: string;
};

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const source = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
    const { data, content } = matter(source);

    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      cover: data.cover,
      duotone: data.duotone ?? "teal",
      readingTime: readingTime(content).text,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
  const source = fs.readFileSync(
    path.join(BLOG_DIR, `${slug}.mdx`),
    "utf8"
  );
  const { data, content } = matter(source);

  return {
    meta: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      date: data.date,
      cover: data.cover,
      duotone: data.duotone ?? "teal",
      readingTime: readingTime(content).text,
    } as PostMeta,
    content,
  };
}
