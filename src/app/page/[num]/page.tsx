import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { Pagination } from "@/app/_components/pagination";
import Sidebar from "@/app/_components/sidebar";
import { getAllPosts, getPaginatedPosts, POSTS_PER_PAGE } from "@/lib/api";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{
    num: string;
  }>;
};

export default async function PageRoute(props: Params) {
  const { num } = await props.params;
  const pageNum = parseInt(num, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  const { posts, totalPages, currentPage } = getPaginatedPosts(pageNum);

  if (pageNum > totalPages) {
    notFound();
  }

  return (
    <main>
      <Container>
        <Header />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <MoreStories posts={posts} />
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
          <Sidebar />
        </div>
      </Container>
    </main>
  );
}

export function generateStaticParams() {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    num: String(i + 1),
  }));
}
