import { Calendar } from "@/components/Calendar";
import React, { PropsWithChildren } from "react";

export default function Loglayout({ children }: PropsWithChildren) {
  return (
    <div className="items-center justify-center w-full h-full ml-3 mr-3">
      {children}
      <div className="fixed bottom-0 right-0 flex h-[70px] w-[70px] items-center justify-center p-5 lg:right-[50px] lg:h-[100px] lg:w-[100px]">
        <Calendar />
      </div>
    </div>
  );
}
