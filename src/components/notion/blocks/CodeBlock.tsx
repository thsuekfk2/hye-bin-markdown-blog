import { CodeBlock as CodeBlockType } from "@/types/notion";
import { NotionCodeBlock } from "../../NotionCodeBlock";

interface CodeBlockProps {
  block: CodeBlockType;
}

export function CodeBlock({ block }: CodeBlockProps) {
  const codeContent = block.code?.rich_text?.[0]?.plain_text || "";
  const language = block.code?.language || "text";

  return <NotionCodeBlock code={codeContent} language={language} />;
}