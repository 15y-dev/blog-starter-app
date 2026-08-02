import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import Sidebar from "@/app/_components/sidebar";
import { getAllPosts } from "@/lib/api";

export default function Index() {
  const allPosts = getAllPosts();

  const morePosts = allPosts.slice();

  return (
    <main>
      <Container>
        <Header />
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <MoreStories posts={morePosts} />
          </div>
          <Sidebar />
        </div>
      </Container>
    </main>
  );
}
