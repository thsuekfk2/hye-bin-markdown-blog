import { HeadingBlock as HeadingBlockType } from "@/types/notion";
import { RichText } from "./RichText";

interface HeadingBlockProps {
  block: HeadingBlockType;
}

export function HeadingBlock({ block }: HeadingBlockProps) {
  const { type, id } = block;

  const getHeadingContent = () => {
    switch (type) {
      case "heading_1":
        return block.heading_1?.rich_text || [];
      case "heading_2":
        return block.heading_2?.rich_text || [];
      case "heading_3":
        return block.heading_3?.rich_text || [];
      default:
        return [];
    }
  };

  const getHeadingClasses = () => {
    switch (type) {
      case "heading_1":
        return "mb-5 mt-7 scroll-mt-7 text-[25px] font-bold text-white";
      case "heading_2":
        return "mb-5 mt-7 scroll-mt-7 text-[22px] font-bold text-white";
      case "heading_3":
        return "mb-5 mt-7 scroll-mt-7 text-[18px] font-bold text-white";
      default:
        return "";
    }
  };

  const HeadingTag = type === "heading_1" ? "h1" : type === "heading_2" ? "h2" : "h3";

  return (
    <HeadingTag id={id} className={getHeadingClasses()}>
      <RichText text={getHeadingContent()} />
    </HeadingTag>
  );
}