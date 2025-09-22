import { QuoteBlock as QuoteBlockType } from "@/types/notion";
import { RichText } from "./RichText";

interface QuoteBlockProps {
  block: QuoteBlockType;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  return (
    <blockquote className="mb-4 rounded-r border border-l-4 border-blue-400 bg-[#333] py-2 pl-4 text-xs italic text-[#dbdbdb]">
      <RichText text={block.quote?.rich_text || []} />
    </blockquote>
  );
}