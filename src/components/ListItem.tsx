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
      className="animate-slide-up flex min-h-[20px] w-[100%] items-center justify-between break-words rounded-lg px-5 py-3 text-xs font-normal transition duration-300 hover:font-bold"
      style={{
        animationDelay: `${index * 50 + 100}ms`,
      }}
    >
      <div>{title}</div>
    </Link>
  );
};
