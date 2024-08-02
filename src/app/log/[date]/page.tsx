import { Log, allLogs } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { format, parseISO } from "date-fns";
import { Giscus } from "@/components/Giscus";
import { Toc } from "@/components/Toc";
import { PrevNextPagination } from "@/components/PrevNextPagination";

export const generateStaticParams = async () => {
  return allLogs.map((post: Log) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: { params: { date: string } }) => {
  const post = allLogs.find(
    (post: Log) => post._raw.sourceFileName === params.date + ".mdx",
  );

  return {
    title: post?.title,
    description: post?.description,
    openGraph: {
      title: post?.title,
      description: post?.description || "이혜빈의 개발블로그",
      type: "website",
      locale: "ko",
      url: `https://hyebin.info/log/${params.date}`,
    },
  };
};

export default async function Page({ params }: { params: { date: string } }) {
  const postIndex = allLogs.findIndex(
    (post: Log) => post._raw.sourceFileName === params.date + ".mdx",
  );
  const post = postIndex !== -1 ? allLogs[postIndex] : null;

  let MDXContent;

  if (!post) {
    return;
  }
  MDXContent = getMDXComponent(post.body.code);

  return (
    <div className="flex w-full flex-col">
      <div>
        <div className="mb-[70px] mt-[40px] text-center font-bold">
          <div className="text-[36px]">{post.title}</div>
          <div className="text-sm">
            {format(parseISO(post.date), "LLLL d, yyyy")}
          </div>
        </div>
        <article>
          <div className="relative">
            <Toc />
            <MDXContent />
          </div>
        </article>
        <PrevNextPagination
          posts={allLogs}
          prevPage={`${
            allLogs[postIndex - 1]?._raw.sourceFileName.split(".")[0]
          }`}
          nextPage={`${
            allLogs[postIndex + 1]?._raw.sourceFileName.split(".")[0]
          }`}
          postIndex={postIndex}
        />
        <Giscus />
      </div>
    </div>
  );
}
