"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

interface NotionMarkdownProps {
  markdown: string;
}

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  const [isWide, setIsWide] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <figure className="mb-6 flex flex-col items-center">
      <FallbackImage
        src={src}
        alt={alt || "Image"}
        className={`h-auto rounded-lg transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"} ${isWide ? "w-full max-w-2xl" : "max-w-[min(24rem,100%)]"}`}
        onRatioCalculated={(ratio) => {
          setIsWide(ratio > 3);
          setLoaded(true);
        }}
      />
      {alt && (
        <figcaption className="mt-2 text-center text-xs text-gray-300">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export function NotionMarkdown({ markdown }: NotionMarkdownProps) {
  return (
    <div className="notion-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkUnwrapImages]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          blockquote({ children, node }) {
            const firstP = (node?.children as any[])?.find(
              (n: any) => n.type === "element" && n.tagName === "p",
            );
            const firstText =
              (firstP?.children as any[])?.find((n: any) => n.type === "text")
                ?.value ?? "";

            const match = firstText.match(/^\[!(.+?)\]$/);
            if (match) {
              const icon = match[1];
              let markerSkipped = false;
              const content = (
                Array.isArray(children) ? (children as any[]) : [children]
              ).filter((child: any) => {
                if (!markerSkipped && child?.type === "p") {
                  markerSkipped = true;
                  return false;
                }
                return true;
              });
              return (
                <div className="callout-block">
                  <span className="callout-icon">{icon}</span>
                  <div className="callout-content">{content}</div>
                </div>
              );
            }

            return <blockquote>{children}</blockquote>;
          },
          img({ src, alt, ...props }) {
            if (!src) return null;
            if ((props as any)["data-column"]) {
              return (
                <img
                  src={src}
                  alt={alt || ""}
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              );
            }
            return <ArticleImage src={src} alt={alt || ""} />;
          },
          a({ href, children }) {
            const isExternal = href?.startsWith("http");
            return (
              <Link
                href={href || "#"}
                className="text-[#818cf8]"
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </Link>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
