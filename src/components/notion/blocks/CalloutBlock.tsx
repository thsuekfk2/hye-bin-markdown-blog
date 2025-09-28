import { CalloutBlock as CalloutBlockType } from "@/types/notion";
import { RichText } from "./RichText";
import { NotionRenderer } from "../NotionRenderer";

interface CalloutBlockProps {
  block: CalloutBlockType;
}

export function CalloutBlock({ block }: CalloutBlockProps) {
  const calloutIcon = block.callout?.icon?.emoji || "💡";


  return (
    <div className="border-0 border-l-4 border-solid border-[#818df8] bg-[#818df814] px-[30px] py-[20px] text-xs text-[#dbdbdb]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-xl">{calloutIcon}</span>
        <div className="flex-1 leading-relaxed">
          <RichText text={block.callout?.rich_text || []} />
          {block.children && block.children.length > 0 && (
            <div className="mt-2">
              <NotionRenderer blocks={block.children} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
