import { Calendar } from "@/components/Calendar";
import React, { PropsWithChildren } from "react";

export default function Loglayout({ children }: PropsWithChildren) {
  return (
    <div className="items-center justify-center w-full h-full">
      {children}
      <div className="flex justify-end fixed bottom-0 p-5 right-[50px]">
        <Calendar />
      </div>
    </div>
  );
}
