import { Log, Post } from "contentlayer/generated";
import Link from "next/link";
import React from "react";

export const PrevNextPagination = ({
  posts,
  prevPage,
  nextPage,
  postIndex,
}: {
  posts: Array<Log | Post>;
  prevPage: string;
  nextPage: string;
  postIndex: number;
}) => {
  return (
    <div className="flex flex-col justify-between gap-8 my-16 md:flex-row">
      <div>
        {posts[postIndex - 1]?.title ? (
          <Link href={prevPage}>
            <p>이전 글</p>
            <p className="font-bold">{posts[postIndex - 1]?.title}</p>
          </Link>
        ) : null}
      </div>
      <div className="text-right">
        {posts.length - 1 !== postIndex && (
          <Link href={nextPage}>
            <p>다음 글</p>
            <p className="font-bold">{posts[postIndex + 1]?.title}</p>
          </Link>
        )}
      </div>
    </div>
  );
};
