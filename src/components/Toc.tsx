"use client";

import { getIntersectionObserver } from "@/utils/observer";
import { useEffect, useState } from "react";

export const Toc = () => {
  const [currentId, setCurrentId] = useState<string>("");
  const [headingEls, setHeadingEls] = useState<Element[]>([]);

  useEffect(() => {
    const observer = getIntersectionObserver(setCurrentId);
    const headings = document.querySelectorAll("h1, h2, h3");
    const headingElements = Array.from(headings);
    setHeadingEls(headingElements);

    headingElements.map((header) => {
      const id = header.textContent!;
      header.id = id;
      observer.observe(header);
    });
  }, []);

  return (
    <>
      <div className="absolute ml-5 left-full">
        <div className="fixed hidden text-xs xl:flex xl:flex-col max-w-[220px] gap-3 text-[#999] top-[120px]">
          {headingEls.map((header, i) =>
            header.nodeName === "H2" || header.nodeName === "H1" ? (
              <div
                className={`text-[12px] ${
                  currentId === header.textContent &&
                  "text-white text-[13px] transition-all duration-125 ease-in delay-0"
                }`}
                key={i}
              >
                <a href={`#${header.id}`}>{header.textContent}</a>
              </div>
            ) : (
              <div
                className={`ml-5 text-[12px] ${
                  currentId === header.textContent &&
                  "text-white text-[13px] transition-all duration-125 ease-in delay-0"
                }`}
                key={i}
              >
                <a href={`#${header.id}`}>{header.textContent}</a>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};
