"use client";

import { useEffect, useState } from "react";

interface NotionTocProps {
  blocks: any[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function NotionToc({ blocks }: NotionTocProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 헤딩 블록들 추출
    const headings = blocks
      .filter((block) =>
        ["heading_1", "heading_2", "heading_3"].includes(block.type),
      )
      .map((block) => ({
        id: block.id,
        text: block[block.type]?.rich_text?.[0]?.plain_text || "",
        level: parseInt(block.type.split("_")[1]),
      }))
      .filter((item) => item.text); // 빈 헤딩 제외

    setTocItems(headings);

    // 스크롤 이벤트로 현재 활성 헤딩 추적
    const handleScroll = () => {
      const headingElements = headings
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.getBoundingClientRect().top <= 100) {
          setActiveId(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [blocks]);

  if (tocItems.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed right-8 top-[100px] hidden w-64 max-w-[220px] transform xl:block">
      <div className="max-h-[80vh] overflow-y-auto rounded-lg border border-gray-600 bg-[#2a2a2a]">
        <ul className="space-y-1">
          {tocItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left text-[12px] transition-colors ${item.level === 1 ? "pl-0" : item.level === 2 ? "pl-3" : "pl-6"} ${
                  activeId === item.id
                    ? "font-medium text-blue-400"
                    : "text-gray-400 hover:text-[#dbdbdb]"
                } `}
              >
                {item.text}
              </button>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
