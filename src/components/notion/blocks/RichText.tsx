import React from "react";
import Link from "next/link";
import { RichTextContent } from "@/types/notion";

interface RichTextProps {
  text: RichTextContent[];
}

export function RichText({ text }: RichTextProps) {
  if (!text || text.length === 0) return null;

  return (
    <>
      {text.map((value, index) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text: textContent,
          href,
        } = value;

        let element: React.ReactNode = textContent?.content || "";

        // 줄바꿈 처리
        if (typeof element === "string" && element.includes("\n")) {
          const lines = element.split("\n");
          element = lines.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          ));
        }

        // 스타일 적용
        if (bold) element = <strong key={index}>{element}</strong>;
        if (italic) element = <em key={index}>{element}</em>;
        if (underline) element = <u key={index}>{element}</u>;
        if (strikethrough) element = <s key={index}>{element}</s>;
        if (code) {
          element = (
            <code
              key={index}
              className="mx-[0.1em] whitespace-normal break-words rounded-[0.3em] bg-[#282a2c] px-[0.3em] py-[0.11em] text-[0.85em] text-[#E3E3E3]"
            >
              {element}
            </code>
          );
        }

        // 링크 적용
        if (href) {
          element = (
            <Link
              key={index}
              href={href}
              className="text-[#818cf8]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {element}
            </Link>
          );
        }

        // 색상 적용
        if (color && color !== "default") {
          const colorClass = getColorClass(color);
          element = (
            <span key={index} className={colorClass}>
              {element}
            </span>
          );
        }

        return <React.Fragment key={index}>{element}</React.Fragment>;
      })}
    </>
  );
}

function getColorClass(color: string): string {
  const colorMap: { [key: string]: string } = {
    gray: "text-gray-600",
    brown: "text-yellow-700",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    red: "text-red-600",
    gray_background: "bg-gray-200",
    brown_background: "bg-yellow-200",
    orange_background: "bg-orange-200",
    yellow_background: "bg-yellow-200",
    green_background: "bg-green-200",
    blue_background: "bg-blue-200",
    purple_background: "bg-purple-200",
    pink_background: "bg-pink-200",
    red_background: "bg-red-200",
  };

  return colorMap[color] || "";
}
