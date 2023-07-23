import { Tag } from "@/components/Tag";
import { getTagsData } from "@/lib/post";
import React from "react";

export default function page() {
  const tags = getTagsData();
  return (
    <div className="flex flex-row h-4 text-center">
      {tags.map((tag, i) => {
        return <Tag key={i} tag={tag}></Tag>;
      })}
    </div>
  );
}
