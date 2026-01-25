"use client";

import Link from "next/link";
import React from "react";
import { format } from "date-fns";

export const ListItem = ({
  slug,
  title,
  date,
  index = 0,
}: {
  slug: string;
  title: string;
  date?: string;
  index?: number;
}) => {
  return (
    <Link
      href={`/log/${slug}`}
      className="animate-slide-up flex min-h-[20px] w-[100%] items-center justify-between break-words rounded-lg px-3 py-3 text-xs font-normal opacity-0 transition duration-300 hover:bg-[#2A2A2A]"
      style={{
        animationDelay: `${index * 30 + 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <span>{title}</span>
      {date && (
        <span className="text-xs text-gray-400">
          {format(new Date(date), "yyyy.MM.dd")}
        </span>
      )}
    </Link>
  );
};
