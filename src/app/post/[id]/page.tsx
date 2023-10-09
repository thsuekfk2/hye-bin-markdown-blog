import { Tag } from "@/components/Tag";
import { getPostContent } from "@/lib/post";

export default async function Page({ params }: { params: { id: string } }) {
  const postData: any = await getPostContent(params.id as string);

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-0 text-center">{postData.title}</h1>
      <div className="flex flex-row justify-center items-center">
        <small className="text-center">{postData.date}</small>
        <div className="text-center flex flex-row">
          {postData.tags.map((data: any, i: string) => (
            <Tag key={i} tag={data}></Tag>
          ))}
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        className="text-sm leading-[29px]"
      />
    </div>
  );
}
