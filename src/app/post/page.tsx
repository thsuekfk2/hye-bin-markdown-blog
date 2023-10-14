import { Card } from "@/components/Card";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import React from "react";

export default function page() {
  const logs = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="h-full w-full justify-center items-center">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>회고록</div>
        <div className="text-xs">소중한 경험을 기록합니다.</div>
      </div>
      <div className="flex items-center flex-wrap gap-6 justify-center">
        {logs.map((post, idx) => (
          <Card
            href={`post/${post._raw.sourceFileName.split(".")[0]}`}
            title={post.title}
          />
        ))}
      </div>
    </div>
  );
}
