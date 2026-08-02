import Link from "next/link";

const Header = () => {
  return (
    <h1 className="text-2xl font-bold tracking-tight leading-tight mb-8 mt-6">
      <Link href="/" className="hover:underline">
        Blog Starter App
      </Link>
    </h1>
  );
};

export default Header;
