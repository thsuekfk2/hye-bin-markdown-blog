"use client";

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
      className="animate-slide-up group flex min-h-[250px] w-[80vw] flex-col transition-all duration-300 md:w-[350px]"
      style={{
        animationDelay: `${index * 100 + 100}ms`,
      }}
    >
      <Link href={href} className="flex flex-col">
        <div className="relative h-[170px] overflow-hidden rounded-md duration-300">
          <div className="absolute z-20 h-full w-full bg-black opacity-0 transition-opacity duration-500 group-hover:opacity-60"></div>
          <div className="absolute bottom-2 left-2 z-20 translate-y-4 leading-tight opacity-0 transition-all duration-500 group-hover:opacity-100">
            <span className="rounded px-2 py-1 text-xs text-white backdrop-blur-sm">
              {description || ""}
            </span>
          </div>
          {/* 백그라운드 이미지 */}
          <Image
            width={300}
            height={250}
            alt="loading"
            src="/jump.webp"
            className="absolute h-[170px] w-full object-cover transition-transform duration-500"
          />
          {/* 실제 썸네일 이미지 */}
          <Image
            width={300}
            height={250}
            alt={title}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg=="
            src={thumbnail || "/jump.webp"}
            className="relative z-10 h-[170px] w-full object-cover opacity-0 transition-all duration-500"
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = "1";
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.opacity = "0";
            }}
          />
        </div>
      </Link>
      <span className="my-1 line-clamp-2 block min-h-[40px] w-full text-sm font-thin transition-colors duration-300 group-hover:text-white">
        {title}
      </span>
    </div>
  );
};
