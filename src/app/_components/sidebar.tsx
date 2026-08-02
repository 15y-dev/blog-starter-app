import { getAllPosts } from "@/lib/api";
import { CATEGORIES, getCategorySlug } from "@/lib/categories";
import Link from "next/link";
import { parseISO, format } from "date-fns";

const Sidebar = () => {
  const allPosts = getAllPosts();
  const latestPosts = allPosts.slice(0, 5);

  // アーカイブ: 年月ごとの記事数を集計（新しい順）
  const archiveMap = new Map<string, number>();
  allPosts.forEach((post) => {
    const date = parseISO(post.date);
    const key = format(date, "yyyy-MM");
    archiveMap.set(key, (archiveMap.get(key) || 0) + 1);
  });
  const archives = Array.from(archiveMap.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  // カテゴリー: CATEGORIESの定義順で記事数を集計
  const categoryCountMap = new Map<string, number>();
  allPosts.forEach((post) => {
    if (post.category) {
      categoryCountMap.set(post.category, (categoryCountMap.get(post.category) || 0) + 1);
    }
  });
  const categories = CATEGORIES
    .map((cat) => ({
      ...cat,
      count: categoryCountMap.get(cat.name) || 0,
    }))
    .filter((cat) => cat.count > 0);

  return (
    <aside className="w-full lg:w-[260px] shrink-0 space-y-8">
      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          最新記事
        </h3>
        <ul className="space-y-2 text-sm">
          {latestPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          アーカイブ
        </h3>
        <ul className="space-y-2 text-sm">
          {archives.map(([yearMonth, count]) => {
            const [year, month] = yearMonth.split("-");
            return (
              <li key={yearMonth}>
                <Link href={`/archives/${yearMonth}`} className="hover:underline">
                  {year}年{parseInt(month)}月 ({count})
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          カテゴリー
        </h3>
        <ul className="space-y-2 text-sm">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link href={`/categories/${cat.slug}`} className="hover:underline">
                {cat.name} ({cat.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
