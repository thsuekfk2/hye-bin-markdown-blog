import { getPostMetadata } from "@/lib/post";
import Link from "next/link";

export default function Home() {
  const postMetadata = getPostMetadata();
  return (
    <div className="h-full w-full justify-center items-center">
      <div className="flex justify-center pb-10">개발 이모저모s</div>
      <div className="flex items-center flex-wrap gap-6 justify-center">
        {postMetadata.map((data, i) => (
          <Link
            key={i}
            href={`/post/${data.slug}`}
            className="flex items-center justify-center w-[30%] min-w-[200px] max-w-[300px] min-h-[200px]  max-h-[300px]  bg-[#444] rounded-lg hover:bg-[#5555]"
          >
            {data.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
