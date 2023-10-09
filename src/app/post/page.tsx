import { Calendar } from "@/components/Calendar";
import { allPosts, Post } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import Link from "next/link";
import React from "react";

function PostCard(post: Post) {
  return (
    <Link
      href={`post/${post._raw.sourceFileName.split(".")[0]}`}
      className="flex items-center justify-center w-[30%] min-w-[200px] max-w-[300px] min-h-[200px]  max-h-[300px]  bg-[#444] rounded-lg hover:bg-[#5555]"
    >
      {post.title}
    </Link>
  );
}

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
          <PostCard key={idx} {...post} />
        ))}
      </div>
    </div>
  );
}
