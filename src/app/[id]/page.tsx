import { getPostContent } from "@/lib/post";

export default async function Page({ params }: { params: { id: number } }) {
  const postData: any = await getPostContent(params.id);
  console.log(postData);
  return (
    <div className="flex flex-col">
      <h1 className="mb-0">{postData.title}</h1>
      <small>{postData.date}</small>
      <div>
        {postData.tags.map((data: any, i: string) => (
          <a key={i}>{data}</a>
        ))}
      </div>
      <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
    </div>
  );
}
