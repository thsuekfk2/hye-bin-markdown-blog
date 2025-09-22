import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Card = ({
  href,
  thumbnail,
  description,
  title,
  index = 0,
  tags = [],
}: {
  href: string;
  thumbnail?: string;
  description?: string;
  title: string;
  index?: number;
  tags?: string[];
}) => {
  return (
    <div
      className="animate-slide-up group flex h-[270px] w-[80vw] transform flex-col opacity-0 transition-all duration-300 hover:-translate-y-2 hover:scale-105 md:w-[350px]"
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
          <div className="absolute z-10 h-full w-full cursor-pointer bg-black bg-gradient-to-t via-transparent to-transparent opacity-0 transition-all duration-500 group-hover:opacity-60"></div>
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

      {/* 태그 표시 */}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
            >
              #{tag}
            </Link>
          ))}
          {tags.length > 3 && (
            <span className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
