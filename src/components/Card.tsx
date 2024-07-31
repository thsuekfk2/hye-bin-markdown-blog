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
    <div className="flex flex-col w-[80%] sm:w-[300px]">
      <Link
        href={href}
        className="flex flex-col text-xs text-transparent hover:text-white"
      >
        <div className="relative cursor-pointer">
          <div className="absolute w-full h-full transition-all cursor-pointer z-1 hover:bg-black opacity-40"></div>
          <div className="absolute transition duration-300 z-2 bottom-2 left-2">
            {description}
          </div>
          <Image
            width={300}
            height={250}
            alt="Picture of the author"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==" // 추가
            src={thumbnail}
            className="rounded-md h-[200px] object-cover w-full"
          />
        </div>
      </Link>
      <span className="text-sm font-thin">{title}</span>
    </div>
  );
};
