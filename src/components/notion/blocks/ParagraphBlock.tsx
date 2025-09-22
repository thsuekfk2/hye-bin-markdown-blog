import { ParagraphBlock as ParagraphBlockType } from "@/types/notion";
import { RichText } from "./RichText";

interface ParagraphBlockProps {
  block: ParagraphBlockType;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
  const isEmpty =
    !block.paragraph?.rich_text || block.paragraph.rich_text.length === 0;

  if (isEmpty) {
    return <div className="h-6"></div>;
  }

  return (
    <p className="mb-4 leading-relaxed text-[#dbdbdb]">
      <RichText text={block.paragraph.rich_text} />
    </p>
  );
}