import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/api";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import Sidebar from "@/app/_components/sidebar";

type Params = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage(props: Params) {
  const params = await props.params;
  const categoryDef = getCategoryBySlug(params.category);

  if (!categoryDef) {
    return notFound();
  }

  const allPosts = getAllPosts();
  const filteredPosts = allPosts.filter(
    (post) => post.category === categoryDef.name
  );

  if (filteredPosts.length === 0) {
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
            <MoreStories posts={filteredPosts} />
          </div>
          <Sidebar />
        </div>
      </Container>
    </main>
  );
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const categoryDef = getCategoryBySlug(params.category);

  if (!categoryDef) {
    return { title: "カテゴリー" };
  }

  return {
    title: `カテゴリー: ${categoryDef.name}`,
  };
}

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}
