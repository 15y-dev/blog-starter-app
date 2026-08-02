import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/api";
import { parseISO, format } from "date-fns";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { MoreStories } from "@/app/_components/more-stories";
import Sidebar from "@/app/_components/sidebar";

type Params = {
  params: Promise<{
    yearMonth: string;
  }>;
};

export default async function ArchivePage(props: Params) {
  const params = await props.params;
  const { yearMonth } = params;

  // yearMonth の形式を検証 (例: "2020-03")
  const match = yearMonth.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return notFound();
  }

  const [, year, month] = match;
  const allPosts = getAllPosts();

  const filteredPosts = allPosts.filter((post) => {
    const date = parseISO(post.date);
    return format(date, "yyyy-MM") === yearMonth;
  });

  if (filteredPosts.length === 0) {
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
  const { yearMonth } = params;
  const match = yearMonth.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return { title: "アーカイブ" };
  }

  const [, year, month] = match;
  return {
    title: `${year}年${parseInt(month)}月の記事`,
  };
}

export async function generateStaticParams() {
  const allPosts = getAllPosts();
  const yearMonths = new Set<string>();

  allPosts.forEach((post) => {
    const date = parseISO(post.date);
    yearMonths.add(format(date, "yyyy-MM"));
  });

  return Array.from(yearMonths).map((yearMonth) => ({
    yearMonth,
  }));
}
