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
    <div className="flex flex-col w-[80%] h-[300px] sm:w-[350px] mt-[2%] mb-[2%]">
      <Link
        href={href}
        className="flex flex-col text-transparent hover:text-white text-xs"
      >
        <div className="relative cursor-pointer">
          <div className="z-1 absolute cursor-pointer hover:bg-black  w-full h-full opacity-40 transition-all"></div>
          <div className="z-2 absolute transition duration-300 bottom-2 left-2">
            {description}
          </div>
          <Image
            width={300}
            height={250}
            alt="Picture of the author"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==" // 추가
            src={thumbnail}
            className="rounded-md h-[250px] object-cover w-full lg:h-[300px]"
          />
        </div>
      </Link>
      <span className="font-thin text-sm">{title}</span>
    </div>
  );
};
