export type Category = {
  slug: string;
  name: string;
};

/** カテゴリーマスター定義（この配列の順番が表示順になります） */
export const CATEGORIES: Category[] = [
  { slug: "astraltale", name: "星界神話" },
  { slug: "ff15", name: "FF15" },
  { slug: "endfield", name: "エンドフィールド" },
  { slug: "zenless", name: "ゼンゼロ" },
  { slug: "watched", name: "見たよ" },
];

/** スラッグからカテゴリーを取得 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** カテゴリー名からスラッグを取得 */
export function getCategorySlug(name: string): string | undefined {
  return CATEGORIES.find((c) => c.name === name)?.slug;
}
