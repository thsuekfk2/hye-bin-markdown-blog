import { Card } from "@/components/Card";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import React from "react";

export default function page() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="items-center justify-center w-full h-full">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>기록</div>
        <div className="text-xs">소중한 경험을 기록합니다.</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6 pb-[5%]">
        {posts.map((post) => (
          <Card
            href={`post/${post._raw.sourceFileName.split(".")[0]}`}
            thumbnail={post.thumbnail ?? ""}
            description={post.description}
            title={post.title}
          />
        ))}
      </div>
    </div>
  );
}
