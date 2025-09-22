import Link from "next/link";
import React from "react";

export const ListItem = ({
  slug,
  title,
  index = 0,
}: {
  slug: string;
  title: string;
  index?: number;
}) => {
  return (
    <Link
      href={`/log/${slug}`}
      className="animate-slide-up flex h-[20px] w-[100%] items-center justify-between break-words rounded-lg p-5 text-xs font-normal opacity-0 transition duration-300 hover:font-bold"
      style={{
        animationDelay: `${index * 50 + 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div>{title}</div>
    </Link>
  );
};
