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
    <div className="flex items-center flex-wrap gap-6 justify-center">
      {logs.map((post, idx) => (
        <LogCard key={idx} {...post} />
      ))}
    </div>
  );
}
