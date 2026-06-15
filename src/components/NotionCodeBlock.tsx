import { codeToHtml } from "shiki";

interface NotionCodeBlockProps {
  code: string;
  language: string;
}

const langMap: Record<string, string> = {
  "plain text": "text",
  shell: "bash",
};

export async function NotionCodeBlock({
  code,
  language,
}: NotionCodeBlockProps) {
  const lang = langMap[language.toLowerCase()] ?? language.toLowerCase();
  let html: string;
  try {
    html = await codeToHtml(code, { lang, theme: "dark-plus" });
  } catch {
    html = await codeToHtml(code, { lang: "text", theme: "dark-plus" });
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
