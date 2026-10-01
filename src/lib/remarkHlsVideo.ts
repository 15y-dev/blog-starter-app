import { visit } from "unist-util-visit";
import type { Root, Image } from "mdast";

/**
 * remark プラグイン: 画像記法で .m3u8 URL が指定された場合に
 * <video data-hls-src="..." controls playsinline> に変換する。
 *
 * 例: ![video](/assets/videos/hls/xxx/playlist.m3u8)
 */
export default function remarkHlsVideo() {
  return (tree: Root) => {
    visit(tree, "image", (node: Image, index, parent) => {
      if (!node.url.endsWith(".m3u8") || index == null || !parent) return;

      parent.children[index] = {
        type: "html",
        value: `<video data-hls-src="${node.url}" controls playsinline></video>`,
      } as any;
    });
  };
}
