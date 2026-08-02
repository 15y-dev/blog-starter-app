const Sidebar = () => {
  return (
    <aside className="w-full lg:w-[260px] shrink-0 space-y-8">
      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          最新記事
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="hover:underline">
              サンプル記事タイトル1
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              サンプル記事タイトル2
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              サンプル記事タイトル3
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          アーカイブ
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="hover:underline">
              2026年07月
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              2026年06月
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3 pb-2 border-b-2 border-neutral-800">
          カテゴリー
        </h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="hover:underline">
              雑談 (3)
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              開発 (5)
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
