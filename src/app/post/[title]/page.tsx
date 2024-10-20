import { Post, allPosts } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { format, parseISO } from "date-fns";
import { Giscus } from "@/components/Giscus";
import { Toc } from "@/components/Toc";
import { PrevNextPagination } from "@/components/PrevNextPagination";

export const generateStaticParams = async () => {
  return allPosts.map((post: Post) => ({ slug: post._raw.flattenedPath }));
};

export const generateMetadata = ({ params }: { params: { title: string } }) => {
  const post = allPosts.find(
    (post: Post) => post._raw.sourceFileName === params.title + ".mdx",
  );

  const defaultDescription = "이혜빈의 개발블로그";
  const description = post?.description || defaultDescription;
  const title = post?.title || "블로그 제목";
  const imageUrl = post?.thumbnail ?? "jump.gif";

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: "website",
      locale: "ko",
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${params.title}`,
      images: [
        {
          width: 1200,
          height: 630,
          url: imageUrl,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      image: imageUrl,
    },
  };
};

export default async function Page({ params }: { params: { title: string } }) {
  const post = allPosts.find(
    (post) => post._raw.sourceFileName === params.title + ".mdx",
  );
  let MDXContent;

  if (!post) {
    return;
  } else {
    MDXContent = getMDXComponent(post!.body.code);
  }

  const postName = Number(post._raw.sourceFileName.split(".")[0]);
  const postIndex = postName - 1;

  return (
    <div className="ml-3 mr-3 flex w-full flex-col">
      <div>
        <div className="mb-[50px] mt-[40px] text-center font-bold">
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
          posts={allPosts}
          prevPage={`${postName - 1}`}
          nextPage={`${postName + 1}`}
          postIndex={postIndex}
        />
        <Giscus />
      </div>
    </div>
  );
}
