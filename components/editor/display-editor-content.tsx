"use client";

import React, { useEffect, useState } from "react";

interface DisplayEditorContentProps {
  content: string;
}

function convertOembedToIframe(html: string): string {
  // 서버 환경에서는 빈 문자열 반환
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const oembeds = doc.querySelectorAll("oembed[url]");

  oembeds.forEach((oembed) => {
    const url = oembed.getAttribute("url")!;
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    );
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      const iframe = document.createElement("iframe");
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "360");
      iframe.setAttribute("src", `https://www.youtube.com/embed/${videoId}`);
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allowfullscreen", "true");

      const figure = oembed.closest("figure");
      if (figure) {
        figure.innerHTML = "";
        figure.appendChild(iframe);
      }
    }
  });

  return doc.body.innerHTML;
}

export default function DisplayEditorContent({
  content,
}: DisplayEditorContentProps) {
  const [convertedHtml, setConvertedHtml] = useState("");

  useEffect(() => {
    setConvertedHtml(convertOembedToIframe(content));
  }, [content]);

  return (
    <div
      className="shadow-lg rounded-xl py-3 px-6 bg-white ck-content text-black"
      dangerouslySetInnerHTML={{ __html: convertedHtml }}
    />
  );
}
