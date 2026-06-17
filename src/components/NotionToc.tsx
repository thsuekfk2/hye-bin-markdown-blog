"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/types/post";

interface NotionTocProps {
  headings: TocItem[];
}

export function NotionToc({ headings }: NotionTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].slug);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActiveId(headings[i].slug);
          return;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));
  const indentClass = ["pl-0", "pl-2", "pl-6"];

  return (
    <div className="fixed right-8 top-[100px] hidden w-64 max-w-[220px] xl:block">
      <div className="max-h-[80vh] overflow-auto rounded-lg border border-gray-600 bg-[#2a2a2a] py-1">
        <ul className="list-none space-y-1 pl-3">
          {headings.map((item) => (
            <li key={item.slug}>
              <button
                onClick={() => {
                  document
                    .getElementById(item.slug)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`block w-full text-left text-[12px] transition-colors ${
                  indentClass[item.level - minLevel] ?? "pl-6"
                } ${
                  activeId === item.slug
                    ? "font-medium text-blue-400"
                    : "text-gray-400"
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
