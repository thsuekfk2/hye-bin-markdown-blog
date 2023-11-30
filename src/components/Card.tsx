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
    <div className="flex flex-col w-[40%] h-[300px] min-w-[200px]">
      <Link
        href={href}
        className="flex flex-col text-transparent hover:text-white text-xs"
      >
        <div className="relative cursor-pointer">
          <div className="z-1 absolute cursor-pointer hover:bg-black  w-full h-full opacity-40 transition-all"></div>
          <div className="z-2 absolute transition duration-300 bottom-2 left-2">
            {description}
          </div>
          <img
            src={thumbnail}
            className="rounded-md h-[200px] object-cover w-full lg:h-[300px]"
          />
        </div>
      </Link>
      <span className="font-thin">{title}</span>
    </div>
  );
};
