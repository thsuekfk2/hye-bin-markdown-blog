import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Card = ({
  href,
  thumbnail,
  description,
  title,
  index = 0,
}: {
  href: string;
  thumbnail?: string;
  description?: string;
  title: string;
  index?: number;
}) => {
  return (
    <div
      className="animate-slide-up group flex h-[260px] w-[80vw] transform flex-col opacity-0 transition-all duration-300 hover:-translate-y-2 hover:scale-105 sm:w-[300px]"
      style={{
        animationDelay: `${index * 100 + 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <Link
        href={href}
        className="flex flex-col text-xs text-transparent hover:text-white"
      >
        <div className="relative cursor-pointer overflow-hidden rounded-md shadow-lg transition-shadow duration-300 group-hover:shadow-2xl">
          <div className="absolute z-10 h-full w-full cursor-pointer bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-60"></div>
          <div className="absolute bottom-2 left-2 z-20 translate-y-4 transform opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="rounded bg-black/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {description || ""}
            </span>
          </div>
          <Image
            width={300}
            height={250}
            alt={title}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            src={thumbnail || "/jump.webp"}
            className="h-[170px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>
      <span className="mt-2 line-clamp-2 h-[40px] overflow-hidden text-sm font-thin transition-colors duration-300 group-hover:text-white">
        {title}
      </span>
    </div>
  );
};
