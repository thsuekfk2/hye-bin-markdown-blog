import { getPostContent } from "@/lib/post";

export default async function Page({ params }: { params: { id: string } }) {
  const postData: any = await getPostContent(params.id as string);
  return (
    <div className="flex flex-col">
      <h1 className="mb-0 text-center">{postData.title}</h1>
      <small className="text-center">{postData.date}</small>
      <div className="text-center">
        {postData.tags.map((data: any, i: string) => (
          <a key={i}>{data}</a>
        ))}
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        className="text-sm leading-[29px]"
      />
    </div>
  );
}
