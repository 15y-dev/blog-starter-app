import { Feed } from "feed";
import { getAllPosts } from "@/lib/api";
import { BLOG_TITLE, BLOG_DESCRIPTION, SITE_URL } from "@/lib/constants";

export async function GET() {
  const posts = getAllPosts();

  const feed = new Feed({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    id: SITE_URL,
    link: SITE_URL,
    language: "ja",
    favicon: `${SITE_URL}/favicon/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    author: {
      name: BLOG_TITLE,
      link: SITE_URL,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/posts/${post.slug}`,
      link: `${SITE_URL}/posts/${post.slug}`,
      description: post.excerpt,
      date: new Date(post.date),
      category: post.category ? [{ name: post.category }] : undefined,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
