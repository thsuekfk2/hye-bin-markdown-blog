import { ListItemBlock } from "@/types/notion";
import { RichText } from "./RichText";
import { NotionRenderer } from "../NotionRenderer";

interface ListBlockProps {
  items: ListItemBlock[];
  type: "numbered" | "bulleted";
}

export function ListBlock({ items, type }: ListBlockProps) {
  if (type === "numbered") {
    return (
      <ol className="mb-4 ml-6" style={{ listStyle: "none" }}>
        {items.map((block) => (
          <li
            key={block.id}
            className="relative leading-relaxed text-[#dbdbdb]"
          >
            <span className="absolute -left-6 font-medium text-[#818cf8]">
              {block.listNumber}.
            </span>
            <RichText text={block.numbered_list_item?.rich_text || []} />
            {block.children && <NotionRenderer blocks={block.children} />}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="mb-4">
      {items.map((block) => (
        <li key={block.id} className="leading-relaxed text-[#dbdbdb]">
          <RichText text={block.bulleted_list_item?.rich_text || []} />
          {block.children && <NotionRenderer blocks={block.children} />}
        </li>
      ))}
    </ul>
  );
}
