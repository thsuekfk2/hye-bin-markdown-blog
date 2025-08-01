import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full w-full items-center justify-center text-center">
      <div className="flex flex-col">
        <Image
          src="https://hyebin-markdown-blog.s3.ap-northeast-2.amazonaws.com/jump.webp"
          width={850}
          height={300}
          className="max-md:hidden"
          alt="점프하는 공룡"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mN8//HLfwYiAOOoQvoqBABbWyZJf74GZgAAAABJRU5ErkJggg==" // 추가
        />
        <h2>프론트엔드 개발자 이혜빈입니다 :)</h2>
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <Link
              target="_blank"
              href="https://github.com/thsuekfk2"
              className="flex items-center hover:text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
                ></path>
              </svg>
            </Link>
          </div>
          {/* <div className="flex mt-5">
            <Link
              target="_blank"
              href="https://hye-bin-home-ground.vercel.app"
              className="flex justify-center w-[60px] h-[24px] transition-all delay-75 hover:line-through text-xs"
            >
              P
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
}
