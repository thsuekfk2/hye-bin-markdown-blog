import { allPosts } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { format, parseISO } from "date-fns";

export const generateStaticParams = async () => {
  return allPosts.map((post: any) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: any) => {
  const post = allPosts.find(
    (post: any) => post._raw.flattenedPath === params.title
  );

  return { title: post?.title, description: post?.description };
};

export default async function Page({ params }: { params: { title: string } }) {
  const post = allPosts.find(
    (post) => post._raw.sourceFileName === params.title + ".mdx"
  );
  let MDXContent;

  if (!post) {
    return;
  } else {
    MDXContent = getMDXComponent(post!.body.code);
  }

  return (
    <div className="flex flex-col w-full">
      <div>
        <div className="text-center font-bold mb-[50px] mt-[40px]">
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
