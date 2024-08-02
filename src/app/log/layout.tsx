import { Calendar } from "@/components/Calendar";
import React, { PropsWithChildren } from "react";

export default function Loglayout({ children }: PropsWithChildren) {
  return (
    <div className="ml-3 mr-3 h-full w-full items-center justify-center">
      {children}
      <div className="fixed bottom-0 right-[50px] flex h-[100px] w-[100px] items-center justify-center p-5">
        <Calendar />
      </div>
    </div>
  );
}
