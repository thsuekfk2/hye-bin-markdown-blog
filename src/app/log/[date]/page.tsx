import { allLogs } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { format, parseISO } from "date-fns";

export const generateStaticParams = async () => {
  return allLogs.map((post: any) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: any) => {
  const post = allLogs.find(
    (post: any) => post._raw.flattenedPath === params.date
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
          <MDXContent />
        </article>
      </div>
    </div>
  );
}
