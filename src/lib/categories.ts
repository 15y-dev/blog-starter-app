export type Category = {
  slug: string;
  name: string;
};

/** カテゴリーマスター定義（この配列の順番が表示順になります） */
export const CATEGORIES: Category[] = [
  { slug: "development", name: "開発" },
  { slug: "general", name: "雑談" },
];

/** スラッグからカテゴリーを取得 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** カテゴリー名からスラッグを取得 */
export function getCategorySlug(name: string): string | undefined {
  return CATEGORIES.find((c) => c.name === name)?.slug;
}
