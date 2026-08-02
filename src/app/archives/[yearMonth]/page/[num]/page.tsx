import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, POSTS_PER_PAGE } from "@/lib/api";
import { parseISO, format } from "date-fns";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import { Pagination } from "@/app/_components/pagination";
import Sidebar from "@/app/_components/sidebar";

type Params = {
  params: Promise<{
    yearMonth: string;
    num: string;
  }>;
};

function getArchivePosts(yearMonth: string, page: number) {
  const allPosts = getAllPosts();
  const filteredPosts = allPosts.filter((post) => {
    const date = parseISO(post.date);
    return format(date, "yyyy-MM") === yearMonth;
  });
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const posts = filteredPosts.slice(start, start + POSTS_PER_PAGE);
  return { posts, totalPages, filteredTotal: filteredPosts.length };
}

export default async function ArchivePageRoute(props: Params) {
  const { yearMonth, num } = await props.params;
  const pageNum = parseInt(num, 10);

  const match = yearMonth.match(/^(\d{4})-(\d{2})$/);
  if (!match || isNaN(pageNum) || pageNum < 1) {
    return notFound();
  }

  const [, year, month] = match;
  const { posts, totalPages } = getArchivePosts(yearMonth, pageNum);

  if (pageNum > totalPages || posts.length === 0) {
    return notFound();
  }

  return (
    <main>
      <Container>
        <Header />
        <h2 className="text-2xl font-bold mb-8">
          {year}年{parseInt(month)}月の記事
        </h2>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <MoreStories posts={posts} />
            <Pagination
              currentPage={pageNum}
              totalPages={totalPages}
              basePath={`/archives/${yearMonth}`}
            />
          </div>
          <Sidebar />
        </div>
      </Container>
    </main>
  );
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const { yearMonth, num } = await props.params;
  const match = yearMonth.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return { title: "アーカイブ" };
  }

  const [, year, month] = match;
  return {
    title: `${year}年${parseInt(month)}月の記事 - ページ${num}`,
  };
}

export async function generateStaticParams() {
  const allPosts = getAllPosts();
  const yearMonthMap = new Map<string, number>();

  allPosts.forEach((post) => {
    const date = parseISO(post.date);
    const ym = format(date, "yyyy-MM");
    yearMonthMap.set(ym, (yearMonthMap.get(ym) || 0) + 1);
  });

  const params: { yearMonth: string; num: string }[] = [];
  yearMonthMap.forEach((count, yearMonth) => {
    const totalPages = Math.ceil(count / POSTS_PER_PAGE);
    for (let i = 1; i <= totalPages; i++) {
      params.push({ yearMonth, num: String(i) });
    }
  });

  return params;
}
