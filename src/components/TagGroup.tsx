"use client";

import { useState } from "react";
import { Tag } from "./Tag";

interface TagGroupProps {
  tags: string[];
  layout?: "flex" | "center";
  expandable?: boolean;
  initialLimit?: number;
  expandStep?: number;
  size?: "sm" | "md";
}

export function TagGroup({ 
  tags, 
  layout = "flex", 
  expandable = false,
  initialLimit = 3,
  expandStep = 3,
  size = "sm"
}: TagGroupProps) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);

  const showMoreTags = () => {
    setVisibleCount(prev => Math.min(prev + expandStep, tags.length));
  };

  const layoutClasses = {
    flex: "flex flex-wrap gap-1",
    center: "flex flex-wrap justify-center gap-2",
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className={layoutClasses[layout]}>
      {tags.slice(0, expandable ? visibleCount : undefined).map((tag) => (
        <Tag key={tag} tag={tag} size={size} />
      ))}
      
      {expandable && tags.length > visibleCount && (
        <button
          onClick={showMoreTags}
          className={`transition-colors rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white ${
            size === "sm" ? "text-[11px] px-2 py-1" : "text-xs px-3 py-1"
          }`}
        >
          +{tags.length - visibleCount}
        </button>
      )}
    </div>
  );
}