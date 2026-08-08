import Link from "next/link";
import { BLOG_TITLE } from "@/lib/constants";

const Header = () => {
  return (
    <h1 className="text-2xl font-bold tracking-tight leading-tight mb-8 mt-6">
      <Link href="/" className="hover:underline">
        {BLOG_TITLE}
      </Link>
    </h1>
  );
};

export default Header;
