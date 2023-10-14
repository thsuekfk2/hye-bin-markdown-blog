import { Card } from "@/components/Card";
import { allLogs } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import React from "react";

export default function page() {
  const logs = allLogs.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );

  return (
    <div>
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>개발 로그</div>
        <div className="text-xs">하루하루 공부한 내용을 기록합니다.</div>
      </div>
      <div className="flex items-center flex-wrap gap-6 justify-center mb-[80px]">
        {logs.map((post, idx) => (
          <Card
            href={`log/${post._raw.sourceFileName.split(".")[0]}`}
            title={post.title}
          />
        ))}
      </div>
    </div>
  );
}
