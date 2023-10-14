import Link from "next/link";
import React from "react";

export const Card = ({ href, title }: { href: string; title: string }) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-center w-[30%] min-w-[200px] max-w-[300px] min-h-[200px]  max-h-[300px]  bg-[#444] rounded-lg hover:bg-[#5555]"
    >
      {title}
    </Link>
  );
};
