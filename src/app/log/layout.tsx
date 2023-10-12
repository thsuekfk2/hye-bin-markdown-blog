import { Calendar } from "@/components/Calendar";
import React, { PropsWithChildren } from "react";

export default function Loglayout({ children }: PropsWithChildren) {
  return (
    <div className="h-full w-full justify-center items-center">
      <div className="flex flex-col justify-center pb-10 text-center">
        <div>개발 로그</div>
        <div className="text-xs">하루하루 공부한 내용을 기록합니다.</div>
      </div>
      {children}
      <div className="flex justify-end fixed bottom-0 p-5 w-full max-w-[800px]">
        <Calendar />
      </div>
    </div>
  );
}
