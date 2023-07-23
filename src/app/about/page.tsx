import Image from "next/image";
import React from "react";

export default async function Page() {
  return (
    <div>
      <Image
        src="/jump.gif"
        width={850}
        height={300}
        alt="Picture of the author"
      />
      <h2>주니어 프론트엔드 개발자 이혜빈입니다.</h2>
      <ul>
        <li>☕ 고양이와 커피를 좋아합니다</li>
      </ul>
    </div>
  );
}
