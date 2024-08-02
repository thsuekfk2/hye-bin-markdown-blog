import Link from "next/link";
import React from "react";

export const ListItem = ({ date, title }: { date: string; title: string }) => {
  return (
    <Link
      href={`log/${date}`}
      className="flex h-[20px] w-[100%] items-center justify-between break-words rounded-lg p-5 text-xs font-normal transition duration-300 hover:font-bold"
    >
      <div className="hover:underline">{title}.</div>
      <div className="text-[#3c3c3c]">{date}</div>
    </Link>
  );
};
