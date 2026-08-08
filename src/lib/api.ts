import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

function generateExcerpt(content: string, maxLength = 200): string {
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plainText.length > maxLength
    ? plainText.slice(0, maxLength) + "..."
    : plainText;
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // ファイル名から日付を生成 (例: "20260628-1" → "2026-06-28T00:00:00.000Z")
  const dateMatch = realSlug.match(/^(\d{4})(\d{2})(\d{2})/);
  const date = dateMatch
    ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00.000Z`
    : data.date;

  return {
    ...data,
    slug: realSlug,
    date,
    content,
    excerpt: generateExcerpt(content),
  } as Post;
}

export const POSTS_PER_PAGE = 6;

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getPaginatedPosts(page: number) {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(start, start + POSTS_PER_PAGE);
  return { posts, totalPages, currentPage: page };
}
