import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, POSTS_PER_PAGE } from "@/lib/api";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { Pagination } from "@/app/_components/pagination";
import Sidebar from "@/app/_components/sidebar";

type Params = {
  params: Promise<{
    category: string;
    num: string;
  }>;
};

function getCategoryPosts(categoryName: string, page: number) {
  const allPosts = getAllPosts();
  const filteredPosts = allPosts.filter(
    (post) => post.category === categoryName
  );
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = filteredPosts.slice(start, start + POSTS_PER_PAGE);
  return { posts, totalPages };
}

export default async function CategoryPageRoute(props: Params) {
  const { category, num } = await props.params;
  const pageNum = parseInt(num, 10);
  const categoryDef = getCategoryBySlug(category);

  if (!categoryDef || isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const { posts, totalPages } = getCategoryPosts(categoryDef.name, pageNum);

  if (pageNum > totalPages || posts.length === 0) {
    return notFound();
  }

  return (
    <main>
      <Container>
        <Header />
        <h2 className="text-2xl font-bold mb-8">
          カテゴリー: {categoryDef.name}
        </h2>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <MoreStories posts={posts} />
            <Pagination
              currentPage={pageNum}
              totalPages={totalPages}
              basePath={`/categories/${category}`}
            />
          </div>
          <Sidebar />
        </div>
      </Container>
    </main>
  );
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { category, num } = await props.params;
  const categoryDef = getCategoryBySlug(category);

  if (!categoryDef) {
    return { title: "カテゴリー" };
  }

  return {
    title: `カテゴリー: ${categoryDef.name} - ページ${num}`,
  };
}

export async function generateStaticParams() {
  const allPosts = getAllPosts();
  const params: { category: string; num: string }[] = [];

  CATEGORIES.forEach((cat) => {
    const count = allPosts.filter((post) => post.category === cat.name).length;
    const totalPages = Math.ceil(count / POSTS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
      params.push({ category: cat.slug, num: String(i) });
    }
  });

  return params;
}
