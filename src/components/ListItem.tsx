import Link from "next/link";
import React from "react";

export const ListItem = ({ date, title }: { date: string; title: string }) => {
  return (
    <Link
      href={`log/${date}`}
      className="justify-between font-normal text-xs flex items-center w-[100%]  h-[20px] rounded-lg transition duration-300 hover:font-bold p-5 break-words"
    >
      <div className="hover:underline">{title}.</div>
      <div className="text-[#3c3c3c]">{date}</div>
    </Link>
  );
};
