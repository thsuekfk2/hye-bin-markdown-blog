import { Log, allLogs } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { format, parseISO } from "date-fns";
import { Giscus } from "@/components/Giscus";
import { Toc } from "@/components/Toc";

export const generateStaticParams = async () => {
  return allLogs.map((post: Log) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: { params: { date: string } }) => {
  const post = allLogs.find(
    (post: Log) => post._raw.flattenedPath === params.date
  );
  return { title: post?.title, description: post?.description };
};

export default async function Page({ params }: { params: { date: string } }) {
  const post = allLogs.find(
    (post) => post._raw.sourceFileName === params.date + ".mdx"
  );

  let MDXContent;

  if (!post) {
    return;
  }
  MDXContent = getMDXComponent(post.body.code);

  return (
    <div className="flex flex-col w-full">
      <div>
        <div className="text-center font-bold mb-[70px] mt-[40px]">
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
        <Giscus />
      </div>
    </div>
  );
}
