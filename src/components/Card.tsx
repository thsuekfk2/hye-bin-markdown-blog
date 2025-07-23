import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Card = ({
  href,
  thumbnail,
  description,
  title,
}: {
  href: string;
  thumbnail: string;
  description: string;
  title: string;
}) => {
  return (
    <div className="flex w-[80%] flex-col sm:w-[300px]">
      <Link
        href={href}
        className="flex flex-col text-xs text-transparent hover:text-white"
      >
        <div className="relative cursor-pointer">
          <div className="z-1 absolute h-full w-full cursor-pointer opacity-40 transition-all hover:bg-black"></div>
          <div className="z-2 absolute bottom-2 left-2 transition duration-300">
            {description}
          </div>
          <Image
            width={300}
            height={250}
            alt="점프하는 공룡"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==" // 추가
            src={thumbnail}
            className="h-[200px] w-full rounded-md object-cover"
          />
        </div>
      </Link>
      <span className="text-sm font-thin">{title}</span>
    </div>
  );
};
