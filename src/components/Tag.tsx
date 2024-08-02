import Link from "next/link";
import React from "react";

export const Tag = ({ tag }: { tag: string }) => {
  return (
    <div className="ml-2 mr-2 w-10 bg-slate-300 text-center text-xs text-black">
      <Link href={"/tag"}>{tag}</Link>
    </div>
  );
};
