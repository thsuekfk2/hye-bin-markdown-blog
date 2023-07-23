import Link from "next/link";
import React from "react";

export const Tag = ({ tag }: { tag: string }) => {
  return (
    <div className="text-center bg-slate-300 w-10 text-xs text-black ml-2 mr-2">
      <Link href={"/tag"}>{tag}</Link>
    </div>
  );
};
