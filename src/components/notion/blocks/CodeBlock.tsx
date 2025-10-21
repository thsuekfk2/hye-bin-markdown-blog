import { CodeBlock as CodeBlockType } from "@/types/notion";
import { NotionCodeBlock } from "../../NotionCodeBlock";

interface CodeBlockProps {
  block: CodeBlockType;
}

export function CodeBlock({ block }: CodeBlockProps) {
  const codeContent =
    block.code?.rich_text?.map((text) => text.plain_text).join("") || "";
  const language = block.code?.language || "text";

  return <NotionCodeBlock code={codeContent} language={language} />;
}
