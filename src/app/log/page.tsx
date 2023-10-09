import { Calendar } from "@/components/Calendar";
import { allLogs, Log } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import Link from "next/link";
import React from "react";

function LogCard(post: Log) {
  return (
    <Link
      href={`log/${post._raw.sourceFileName.split(".")[0]}`}
      className="flex items-center justify-center w-[30%] min-w-[200px] max-w-[300px] min-h-[200px]  max-h-[300px]  bg-[#444] rounded-lg hover:bg-[#5555]"
    >
      {post.title}
    </Link>
  );
}

export default function page() {
  const logs = allLogs.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div className="h-full w-full justify-center items-center">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>개발 로그</div>
        <div className="text-xs">하루하루 공부한 내용을 기록합니다.</div>
      </div>
      <div className="flex items-center flex-wrap gap-6 justify-center">
        {logs.map((post, idx) => (
          <LogCard key={idx} {...post} />
        ))}
      </div>
      <div className="absolute right-0 bottom-0 m-10">
        <Calendar />
      </div>
    </div>
  );
}
