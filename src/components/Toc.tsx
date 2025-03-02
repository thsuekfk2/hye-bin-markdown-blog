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
      <div className="absolute left-full ml-5">
        <div className="fixed top-[120px] hidden max-h-[80vh] max-w-[220px] gap-3 overflow-auto text-xs text-[#999] xl:flex xl:flex-col">
          {headingEls.map((header, i) =>
            header.nodeName === "H2" || header.nodeName === "H1" ? (
              <div
                className={`text-[12px] ${
                  currentId === header.textContent &&
                  "duration-125 text-[13px] text-white transition-all delay-0 ease-in"
                }`}
                key={i}
              >
                <a href={`#${header.id}`}>{header.textContent}</a>
              </div>
            ) : (
              <div
                className={`ml-5 text-[12px] ${
                  currentId === header.textContent &&
                  "duration-125 text-[13px] text-white transition-all delay-0 ease-in"
                }`}
                key={i}
              >
                <a href={`#${header.id}`}>{header.textContent}</a>
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
};
