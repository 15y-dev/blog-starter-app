import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { Pagination } from "@/app/_components/pagination";
import Sidebar from "@/app/_components/sidebar";
import { getPaginatedPosts } from "@/lib/api";

export default function Index() {
  const { posts, totalPages, currentPage } = getPaginatedPosts(1);

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
