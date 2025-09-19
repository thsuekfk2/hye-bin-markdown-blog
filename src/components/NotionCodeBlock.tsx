'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface NotionCodeBlockProps {
  code: string;
  language: string;
}

export function NotionCodeBlock({ code, language }: NotionCodeBlockProps) {
  // 언어 매핑 (노션 언어명 → Prism 언어명)
  const getLanguage = (lang: string) => {
    const langMap: { [key: string]: string } = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'css': 'css',
      'html': 'markup',
      'json': 'json',
      'bash': 'bash',
      'shell': 'bash',
      'python': 'python',
      'go': 'go',
      'rust': 'rust',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'sql': 'sql',
      'yaml': 'yaml',
      'xml': 'markup',
      'markdown': 'markdown',
    };
    
    return langMap[lang.toLowerCase()] || 'text';
  };

  // 기존 스타일과 동일하게 맞춘 커스텀 스타일
  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      backgroundColor: 'rgb(40, 44, 52)',
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      overflow: 'auto',
      fontSize: '0.875rem',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      border: '1px solid #21262d',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      backgroundColor: 'transparent',
      fontSize: '0.875rem',
      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    }
  };

  return (
    <SyntaxHighlighter
      language={getLanguage(language)}
      style={customStyle}
      customStyle={{
        margin: 0,
        padding: '1rem',
        backgroundColor: 'rgb(40, 44, 52)',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        border: '1px solid #21262d',
        whiteSpace: 'pre',
        lineHeight: '1.5',
        overflowWrap: 'normal',
        wordBreak: 'normal',
      }}
      codeTagProps={{
        style: {
          backgroundColor: 'transparent',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          display: 'grid',
          whiteSpace: 'pre',
        }
      }}
      wrapLines={true}
      wrapLongLines={false}
      PreTag={({ children, ...props }) => (
        <pre 
          {...props}
          tabIndex={0}
          data-language={language}
          data-theme="default"
          style={{
            backgroundColor: 'rgb(40, 44, 52)',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            border: '1px solid #21262d',
            whiteSpace: 'pre',
            lineHeight: '1.5',
          }}
        >
          {children}
        </pre>
      )}
    >
      {code}
    </SyntaxHighlighter>
  );
}