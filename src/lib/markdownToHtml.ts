import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import remarkHlsVideo from "./remarkHlsVideo";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHlsVideo)
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}
