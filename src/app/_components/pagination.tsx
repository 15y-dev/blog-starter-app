import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath?: string; // 例: "/archives/2026-07" or "/categories/astraltale"
};

export function Pagination({ currentPage, totalPages, basePath = "" }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function getPageHref(page: number) {
    if (basePath) {
      return page === 1 ? basePath : `${basePath}/page/${page}`;
    }
    return page === 1 ? "/" : `/page/${page}`;
  }

  return (
    <nav className="flex justify-center items-center gap-2 my-12">
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="前のページ"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <span className="p-2 rounded bg-gray-800/50 text-gray-600 cursor-not-allowed">
          <ChevronLeft size={20} />
        </span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={getPageHref(page)}
          className={`px-4 py-2 rounded transition-colors ${
            page === currentPage
              ? "bg-white text-black font-bold"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={getPageHref(currentPage + 1)}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="次のページ"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <span className="p-2 rounded bg-gray-800/50 text-gray-600 cursor-not-allowed">
          <ChevronRight size={20} />
        </span>
      )}
    </nav>
  );
}
