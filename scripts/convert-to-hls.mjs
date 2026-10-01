/**
 * public/assets/videos/ 内の全MP4をHLS形式に変換するスクリプト
 *
 * 使い方: node scripts/convert-to-hls.mjs
 * 出力先: public/assets/videos/hls/<name>/playlist.m3u8
 */
import { execSync } from "node:child_process";
import { readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, basename, extname } from "node:path";

const VIDEOS_DIR = join(process.cwd(), "public", "assets", "videos");
const HLS_DIR = join(VIDEOS_DIR, "hls");

const mp4Files = readdirSync(VIDEOS_DIR).filter(
  (f) => extname(f).toLowerCase() === ".mp4"
);

if (mp4Files.length === 0) {
  console.log("変換対象のMP4ファイルが見つかりません。");
  process.exit(0);
}

for (const file of mp4Files) {
  const input = join(VIDEOS_DIR, file);
  const name = basename(file, extname(file));
  const outDir = join(HLS_DIR, name);

  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  const output = join(outDir, "playlist.m3u8");

  if (existsSync(output)) {
    console.log(`⏭  スキップ (変換済み): ${file}`);
    continue;
  }

  console.log(`🔄 変換中: ${file} → ${outDir}`);

  const cmd = [
    "ffmpeg",
    `-i "${input}"`,
    "-codec: copy",
    "-start_number 0",
    "-hls_time 6",
    "-hls_list_size 0",
    "-hls_segment_filename",
    `"${join(outDir, "seg%03d.ts")}"`,
    "-f hls",
    `"${output}"`,
    "-y",
  ].join(" ");

  try {
    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ 完了: ${file}`);
  } catch (e) {
    console.error(`❌ 失敗: ${file}`, e.message);
  }
}

console.log("🎬 HLS変換が完了しました。");
