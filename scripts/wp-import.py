"""
WordPress XML Export → Markdown 変換スクリプト

使い方:
  python scripts/wp-import.py doc/quesutoblog.WordPress.2026-08-02.xml

出力:
  - _posts/ に Markdown ファイルを生成
  - public/assets/blog/ に画像をダウンロード
  - カテゴリー情報を表示（categories.ts 更新用）
"""

import xml.etree.ElementTree as ET
import os
import re
import sys
import urllib.request
import urllib.error
from html import unescape
from datetime import datetime

# ===== 設定 =====
OUTPUT_POSTS_DIR = os.path.join(os.path.dirname(__file__), "..", "_posts")
OUTPUT_ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "blog")
DEFAULT_AUTHOR_NAME = "のい太"
DEFAULT_AUTHOR_PICTURE = "/assets/blog/authors/default.jpeg"

# WordPress XML の名前空間
NAMESPACES = {
    "content": "http://purl.org/rss/1.0/modules/content/",
    "excerpt": "http://wordpress.org/export/1.2/excerpt/",
    "wp": "http://wordpress.org/export/1.2/",
    "dc": "http://purl.org/dc/elements/1.1/",
}


def convert_table_to_markdown(html: str) -> str:
    """HTML テーブルを Markdown テーブルに変換する"""
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", html, re.DOTALL)
    if not rows:
        return ""

    md_rows = []
    for row in rows:
        cells = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row, re.DOTALL)
        clean_cells = []
        for cell in cells:
            # <br> をプレースホルダーに変換（後で復元）
            c = re.sub(r"<br\s*/?>", "%%BR%%", cell)
            # リンクをMarkdownに変換
            c = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r"[\2](\1)", c, flags=re.DOTALL)
            # その他のHTMLタグは削除
            c = re.sub(r"</?[^>]+>", "", c)
            c = unescape(c).strip()
            # パイプ文字をエスケープ
            c = c.replace("|", "\\|")
            clean_cells.append(c)
        md_rows.append("| " + " | ".join(clean_cells) + " |")

    if not md_rows:
        return ""

    # ヘッダー区切り行を追加
    col_count = md_rows[0].count("|") - 1
    separator = "| " + " | ".join(["---"] * col_count) + " |"
    result = [md_rows[0], separator] + md_rows[1:]

    return "\n" + "\n".join(result) + "\n"


def clean_html_to_markdown(html_content: str, slug: str, images_map: dict) -> tuple[str, str | None]:
    """WordPress HTML コンテンツを Markdown に変換する"""
    if not html_content:
        return "", None

    text = html_content

    # WordPress コメントブロックを削除
    text = re.sub(r"<!-- /?wp:\w+[^>]* -->", "", text)

    first_image = None

    # figure > img タグを Markdown 画像に変換し、画像をダウンロード
    def replace_figure(match):
        nonlocal first_image
        full_match = match.group(0)

        # テーブルを含む figure はテーブルとして処理
        if "<table" in full_match:
            return convert_table_to_markdown(full_match)

        img_match = re.search(r'src="([^"]+)"', full_match)
        alt_match = re.search(r'alt="([^"]*)"', full_match)

        if img_match:
            src = img_match.group(1)
            alt = alt_match.group(1) if alt_match else ""
            local_path = download_image(src, slug)
            if local_path:
                if first_image is None:
                    first_image = local_path
                return f"\n![{alt}]({local_path})\n"

        # embed (YouTube等) を含む figure
        embed_match = re.search(r'(https?://(?:www\.)?youtube\.com/watch\?v=[^\s<"]+)', full_match)
        if embed_match:
            return f"\n{embed_match.group(1)}\n"

        return ""

    text = re.sub(r"<figure[^>]*>.*?</figure>", replace_figure, text, flags=re.DOTALL)

    # 残りの img タグも処理
    def replace_img(match):
        nonlocal first_image
        src_match = re.search(r'src="([^"]+)"', match.group(0))
        alt_match = re.search(r'alt="([^"]*)"', match.group(0))
        if src_match:
            src = src_match.group(1)
            alt = alt_match.group(1) if alt_match else ""
            local_path = download_image(src, slug)
            if local_path:
                if first_image is None:
                    first_image = local_path
                return f"\n![{alt}]({local_path})\n"
        return ""

    text = re.sub(r"<img[^>]+/?>", replace_img, text)

    # HTML見出しを Markdown に変換
    text = re.sub(r"<h2[^>]*>(.*?)</h2>", r"\n## \1\n", text, flags=re.DOTALL)
    text = re.sub(r"<h3[^>]*>(.*?)</h3>", r"\n### \1\n", text, flags=re.DOTALL)
    text = re.sub(r"<h4[^>]*>(.*?)</h4>", r"\n#### \1\n", text, flags=re.DOTALL)

    # リンクを Markdown に変換
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r"[\2](\1)", text, flags=re.DOTALL)

    # strong/em を Markdown に変換
    text = re.sub(r"<strong>(.*?)</strong>", r"**\1**", text)
    text = re.sub(r"<em>(.*?)</em>", r"*\1*", text)

    # リストを変換
    text = re.sub(r"<ul[^>]*>", "", text)
    text = re.sub(r"</ul>", "", text)
    text = re.sub(r"<ol[^>]*>", "", text)
    text = re.sub(r"</ol>", "", text)
    text = re.sub(r"<li[^>]*>(.*?)</li>", r"- \1", text, flags=re.DOTALL)

    # blockquote を変換
    text = re.sub(r"<blockquote[^>]*>(.*?)</blockquote>", lambda m: "\n".join(f"> {line}" for line in m.group(1).strip().split("\n")), text, flags=re.DOTALL)

    # 残りの HTML タグを削除
    text = re.sub(r"</?p[^>]*>", "\n", text)
    text = re.sub(r"<br\s*/?>", "\n", text)
    text = re.sub(r"</?[^>]+>", "", text)

    # HTML エンティティをデコード
    text = unescape(text)

    # プレースホルダーを <br> に復元（テーブルセル内の改行用）
    text = text.replace("%%BR%%", "<br>")

    # 連続する空行を最大2つに
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    return text, first_image


def download_image(url: str, slug: str) -> str | None:
    """画像をダウンロードしてローカルパスを返す"""
    try:
        # ファイル名を取得
        filename = url.split("/")[-1]
        # サイズ指定サフィックスを除去 (例: image-13-1024x576.png → image-13.png)
        clean_filename = re.sub(r"-\d+x\d+(\.\w+)$", r"\1", filename)

        # 全画像を1つのフォルダに格納
        images_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets", "images")
        os.makedirs(images_dir, exist_ok=True)

        local_file = os.path.join(images_dir, clean_filename)
        web_path = f"/assets/images/{clean_filename}"

        # 既にダウンロード済みならスキップ
        if os.path.exists(local_file):
            print(f"  [SKIP] {clean_filename} (already exists)")
            return web_path

        print(f"  [DL] {url}")
        # リサイズ版ではなく元画像を取得するため、URLを調整
        original_url = re.sub(r"-\d+x\d+(\.\w+)$", r"\1", url)

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        try:
            req = urllib.request.Request(original_url, headers=headers)
            with urllib.request.urlopen(req) as response, open(local_file, "wb") as out_file:
                out_file.write(response.read())
        except urllib.error.HTTPError:
            # 元画像が無ければリサイズ版をダウンロード
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response, open(local_file, "wb") as out_file:
                out_file.write(response.read())

        return web_path

    except Exception as e:
        print(f"  [ERROR] Failed to download {url}: {e}")
        return url  # ダウンロード失敗時は元のURLを使用


def make_slug(post_name: str, title: str, post_id: str) -> str:
    """投稿からスラッグを生成する"""
    # URL エンコードされた日本語のpost_nameをデコード
    decoded = urllib.request.unquote(post_name)

    # ASCII のみのスラッグならそのまま使用
    if re.match(r"^[a-z0-9-]+$", decoded):
        return decoded

    # 数字のみ(WordPress の自動ID)の場合はpost_idを使う
    if re.match(r"^\d+$", decoded):
        return f"post-{post_id}"

    # 日本語スラッグの場合は post_id ベースにする
    return f"post-{post_id}"


def generate_excerpt(content: str, max_length: int = 200) -> str:
    """コンテンツから抜粋を生成する"""
    # Markdown 記法を除去
    text = re.sub(r"!\[.*?\]\(.*?\)", "", content)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"[#*_>`-]", "", text)
    text = re.sub(r"\n+", " ", text)
    text = text.strip()

    if len(text) > max_length:
        text = text[:max_length] + "..."
    return text


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/wp-import.py <wordpress-export.xml>")
        sys.exit(1)

    xml_path = sys.argv[1]
    print(f"Reading: {xml_path}")

    tree = ET.parse(xml_path)
    root = tree.getroot()
    channel = root.find("channel")

    # カテゴリーマップを構築 (nicename → cat_name)
    category_map = {}
    for cat in channel.findall("wp:category", NAMESPACES):
        nicename = cat.find("wp:category_nicename", NAMESPACES).text
        cat_name = cat.find("wp:cat_name", NAMESPACES).text
        category_map[nicename] = cat_name

    print(f"\nCategories found: {category_map}")

    # 著者マップを構築
    author_map = {}
    for author in channel.findall("wp:author", NAMESPACES):
        login = author.find("wp:author_login", NAMESPACES).text
        display_name = author.find("wp:author_display_name", NAMESPACES).text
        author_map[login] = display_name

    print(f"Authors found: {author_map}")

    # 添付ファイルマップ (post_id → attachment_url)
    attachment_map = {}
    for item in channel.findall("item"):
        post_type = item.find("wp:post_type", NAMESPACES)
        if post_type is not None and post_type.text == "attachment":
            post_id = item.find("wp:post_id", NAMESPACES).text
            url = item.find("wp:attachment_url", NAMESPACES)
            if url is not None:
                attachment_map[post_id] = url.text

    # サムネイル（_thumbnail_id）マップ
    thumbnail_map = {}
    for item in channel.findall("item"):
        post_type = item.find("wp:post_type", NAMESPACES)
        if post_type is not None and post_type.text == "post":
            post_id = item.find("wp:post_id", NAMESPACES).text
            for meta in item.findall("wp:postmeta", NAMESPACES):
                meta_key = meta.find("wp:meta_key", NAMESPACES).text
                if meta_key == "_thumbnail_id":
                    meta_value = meta.find("wp:meta_value", NAMESPACES).text
                    thumbnail_map[post_id] = meta_value

    # 出力ディレクトリ作成
    os.makedirs(OUTPUT_POSTS_DIR, exist_ok=True)

    # 記事を処理
    post_count = 0
    categories_used = set()

    for item in channel.findall("item"):
        post_type = item.find("wp:post_type", NAMESPACES)
        if post_type is None or post_type.text != "post":
            continue

        status = item.find("wp:status", NAMESPACES).text
        if status != "publish":
            print(f"  [SKIP] Draft/non-published post")
            continue

        title = item.find("title").text or "Untitled"
        post_id = item.find("wp:post_id", NAMESPACES).text
        post_name = item.find("wp:post_name", NAMESPACES).text or f"post-{post_id}"
        post_date_gmt = item.find("wp:post_date_gmt", NAMESPACES).text
        creator = item.find("dc:creator", NAMESPACES).text or "noita"
        content_encoded = item.find("content:encoded", NAMESPACES).text or ""
        excerpt_encoded = item.find("excerpt:encoded", NAMESPACES).text or ""

        # カテゴリー取得
        categories = []
        for cat_el in item.findall("category"):
            if cat_el.get("domain") == "category":
                categories.append(cat_el.text)

        category = categories[0] if categories else "Uncategorized"
        categories_used.add(category)

        # スラッグ生成
        slug = make_slug(post_name, title, post_id)

        print(f"\n[{post_count + 1}] Processing: {title} (slug: {slug})")

        # 日付を ISO 形式に変換
        try:
            dt = datetime.strptime(post_date_gmt, "%Y-%m-%d %H:%M:%S")
            date_iso = dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        except ValueError:
            date_iso = post_date_gmt

        # コンテンツを Markdown に変換
        markdown_content, first_image = clean_html_to_markdown(content_encoded, slug, attachment_map)

        # 抜粋を生成
        if excerpt_encoded:
            excerpt = excerpt_encoded
        else:
            excerpt = generate_excerpt(markdown_content)

        # カバー画像を決定
        cover_image = ""
        # 1. WordPress のサムネイルを確認
        if post_id in thumbnail_map:
            thumb_id = thumbnail_map[post_id]
            if thumb_id in attachment_map:
                thumb_url = attachment_map[thumb_id]
                cover_image = download_image(thumb_url, slug)

        # 2. サムネイルが無ければ本文中の最初の画像を使用
        if not cover_image and first_image:
            cover_image = first_image

        # 3. どちらも無ければデフォルト
        if not cover_image:
            cover_image = ""

        # 著者情報
        author_name = author_map.get(creator, DEFAULT_AUTHOR_NAME)

        # Markdown ファイルを生成
        escaped_title = title.replace('"', '\\"')
        escaped_excerpt = excerpt.replace('"', '\\"')
        frontmatter = f"""---
title: "{escaped_title}"
excerpt: "{escaped_excerpt}"
coverImage: "{cover_image}"
date: "{date_iso}"
author:
  name: {author_name}
  picture: {DEFAULT_AUTHOR_PICTURE}
ogImage:
  url: "{cover_image}"
category: "{category}"
---"""

        md_content = f"{frontmatter}\n\n{markdown_content}\n"

        # ファイル出力
        output_path = os.path.join(OUTPUT_POSTS_DIR, f"{slug}.md")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md_content)

        print(f"  → Saved: {output_path}")
        post_count += 1

    print(f"\n{'=' * 50}")
    print(f"Converted {post_count} posts")
    print(f"\nCategories used:")
    for cat in sorted(categories_used):
        nicename = [k for k, v in category_map.items() if v == cat]
        slug_name = nicename[0] if nicename else cat.lower()
        print(f'  {{ slug: "{slug_name}", name: "{cat}" }},')

    print(f"\n→ Update src/lib/categories.ts with the categories above")


if __name__ == "__main__":
    main()
