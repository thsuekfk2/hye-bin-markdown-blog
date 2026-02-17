"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface NotionCodeBlockProps {
  code: string;
  language: string;
}

export function NotionCodeBlock({ code, language }: NotionCodeBlockProps) {
  const getLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      javascript: "javascript",
      typescript: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      css: "css",
      html: "markup",
      json: "json",
      bash: "bash",
      shell: "bash",
      python: "python",
      go: "go",
      rust: "rust",
      java: "java",
      c: "c",
      cpp: "cpp",
      sql: "sql",
      yaml: "yaml",
      xml: "markup",
      markdown: "markdown",
    };

    return langMap[lang.toLowerCase()] || "text";
  };

  return (
    <SyntaxHighlighter
      language={getLanguage(language)}
      style={vscDarkPlus}
      wrapLongLines={true}
      customStyle={{
        margin: "0 0 1.5rem 0",
        padding: "1rem",
        borderRadius: "0.5rem",
        fontSize: "0.8rem",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowX: "hidden",
        backgroundColor: "rgb(23, 24, 25)",
        border: "1px solid rgb(33, 38, 45)",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
