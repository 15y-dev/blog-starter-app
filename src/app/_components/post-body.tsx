"use client";

import { useState, useEffect, useCallback, useRef, MouseEvent } from "react";
import Hls from "hls.js";
import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const handleContentClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      e.preventDefault();
      setLightboxSrc((target as HTMLImageElement).src);
    }
  }, []);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxSrc, closeLightbox]);

  const contentRef = useRef<HTMLDivElement>(null);

  // data-hls-src 属性を持つ <video> 要素に hls.js を適用
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const videos = container.querySelectorAll<HTMLVideoElement>("video[data-hls-src]");
    const hlsInstances: Hls[] = [];

    videos.forEach((video) => {
      const src = video.getAttribute("data-hls-src");
      if (!src) return;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsInstances.push(hls);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      }
    });

    return () => {
      hlsInstances.forEach((hls) => hls.destroy());
    };
  }, [content]);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        ref={contentRef}
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={handleContentClick}
      />

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={closeLightbox}
        >
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
