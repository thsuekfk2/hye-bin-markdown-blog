"use client";

import React, { useRef } from "react";
import { useEffect } from "react";

export const Giscus = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = "dark";

  const repo = process.env.NEXT_PUBLIC_COMMENTS_REPO!;
  const repoId = process.env.NEXT_PUBLIC_COMMENTS_REPO_ID!;
  const categoryId = process.env.NEXT_PUBLIC_COMMENTS_CATEGORY_ID!;

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;
    const scriptElem = document.createElement("script");
    scriptElem.src = "https://giscus.app/client.js";
    scriptElem.async = true;
    scriptElem.crossOrigin = "anonymous";
    scriptElem.setAttribute("data-repo", repo);
    scriptElem.setAttribute("data-repo-id", repoId);
    scriptElem.setAttribute("data-category", "General");
    scriptElem.setAttribute("data-category-id", categoryId);
    scriptElem.setAttribute("data-mapping", "pathname");
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "1");
    scriptElem.setAttribute("data-input-position", "bottom");
    scriptElem.setAttribute("data-theme", theme);
    scriptElem.setAttribute("data-lang", "ko");
    scriptElem.setAttribute("data-loading", "lazy");
    scriptElem.setAttribute("crossorigin", "anonymous");
    ref.current.appendChild(scriptElem);
  }, []);

  return <section className="mt-[100px] mb-[80px]" ref={ref} />;
};
