import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NotionCodeBlock } from "./NotionCodeBlock";

interface NotionBlock {
  id: string;
  type: string;
  [key: string]: any;
}

interface NotionRendererProps {
  blocks: NotionBlock[];
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  // 연속된 리스트 아이템들을 그룹화하고 전체 번호 추적
  const groupedBlocks: any[] = [];
  let currentGroup: NotionBlock[] = [];
  let currentType: string | null = null;
  let numberedListCounter = 0;

  for (const block of blocks) {
    if (
      block.type === "numbered_list_item" ||
      block.type === "bulleted_list_item"
    ) {
      // numbered_list_item의 경우 연속 번호 추적
      if (block.type === "numbered_list_item") {
        numberedListCounter++;
        (block as any).listNumber = numberedListCounter;
      }

      if (currentType === block.type) {
        currentGroup.push(block);
      } else {
        if (currentGroup.length > 0) {
          groupedBlocks.push({
            type: `${currentType}_group`,
            items: currentGroup,
          });
        }
        currentGroup = [block];
        currentType = block.type;
      }
    } else {
      if (currentGroup.length > 0) {
        groupedBlocks.push({
          type: `${currentType}_group`,
          items: currentGroup,
        });
        currentGroup = [];
        currentType = null;
      }

      // heading, divider, 빈 paragraph가 나오면 번호 리셋
      if (
        block.type.startsWith("heading_") ||
        block.type === "divider" ||
        (block.type === "paragraph" &&
          (!block.paragraph?.rich_text ||
            block.paragraph.rich_text.length === 0))
      ) {
        numberedListCounter = 0;
      }

      groupedBlocks.push(block);
    }
  }

  // 마지막 그룹 처리
  if (currentGroup.length > 0) {
    groupedBlocks.push({ type: `${currentType}_group`, items: currentGroup });
  }

  return (
    <div className="notion-content">
      {groupedBlocks.map((item, index) => {
        if (item.type === "numbered_list_item_group") {
          return (
            <ol
              key={`ol-${index}`}
              className="mb-4 ml-6"
              style={{ listStyle: "none" }}
            >
              {item.items.map((block: NotionBlock) => (
                <li
                  key={block.id}
                  className="relative leading-relaxed text-[#dbdbdb]"
                >
                  <span className="absolute -left-6 font-medium text-[#818cf8]">
                    {(block as any).listNumber}.
                  </span>
                  <RichText text={block.numbered_list_item?.rich_text || []} />
                  {block.children && <NotionRenderer blocks={block.children} />}
                </li>
              ))}
            </ol>
          );
        } else if (item.type === "bulleted_list_item_group") {
          return (
            <ul key={`ul-${index}`} className="mb-4">
              {item.items.map((block: NotionBlock) => (
                <li key={block.id} className="leading-relaxed text-[#dbdbdb]">
                  <RichText text={block.bulleted_list_item?.rich_text || []} />
                  {block.children && <NotionRenderer blocks={block.children} />}
                </li>
              ))}
            </ul>
          );
        } else {
          return (
            <NotionBlock
              key={item.id || `block-${index}`}
              block={item as NotionBlock}
            />
          );
        }
      })}
    </div>
  );
}

function NotionBlock({ block }: { block: NotionBlock }) {
  const { type } = block;

  switch (type) {
    case "paragraph":
      const isEmpty =
        !block.paragraph?.rich_text || block.paragraph.rich_text.length === 0;

      if (isEmpty) {
        return <div className="h-6"></div>;
      }

      return (
        <p className="mb-4 leading-relaxed text-[#dbdbdb]">
          <RichText text={block.paragraph?.rich_text || []} />
        </p>
      );

    case "heading_1":
      return (
        <h1
          id={block.id}
          className="mb-5 mt-7 scroll-mt-7 text-[25px] font-bold text-white"
        >
          <RichText text={block.heading_1?.rich_text || []} />
        </h1>
      );

    case "heading_2":
      return (
        <h2
          id={block.id}
          className="mb-5 mt-7 scroll-mt-7 text-[22px] font-bold text-white"
        >
          <RichText text={block.heading_2?.rich_text || []} />
        </h2>
      );

    case "heading_3":
      return (
        <h3
          id={block.id}
          className="mb-5 mt-7 scroll-mt-7 text-[18px] font-bold text-white"
        >
          <RichText text={block.heading_3?.rich_text || []} />
        </h3>
      );

    case "bulleted_list_item":
    case "numbered_list_item":
      // 이제 그룹으로 처리되므로 개별적으로는 렌더링하지 않음
      return null;

    case "code":
      const codeContent = block.code?.rich_text?.[0]?.plain_text || "";
      const language = block.code?.language || "text";

      return <NotionCodeBlock code={codeContent} language={language} />;

    case "quote":
      return (
        <blockquote className="mb-4 rounded-r border border-l-4 border-blue-400 bg-[#333] py-2 pl-4 text-xs italic text-[#dbdbdb]">
          <RichText text={block.quote?.rich_text || []} />
        </blockquote>
      );

    case "callout":
      const calloutIcon = block.callout?.icon?.emoji || "💡";

      return (
        <div
          className={`border-0 border-l-4 border-solid border-[#818df8] bg-[#818df814] px-[30px] py-[20px] text-xs text-[#dbdbdb]`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 text-xl">{calloutIcon}</span>
            <div className="flex-1 leading-relaxed">
              <RichText text={block.callout?.rich_text || []} />
            </div>
          </div>
        </div>
      );

    case "image":
      const imageUrl = block.image?.file?.url || block.image?.external?.url;
      const caption = block.image?.caption?.[0]?.plain_text || "";

      return (
        <figure className="mb-6 flex flex-col items-center">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={caption || "Image"}
              width={800}
              height={600}
              className="h-auto w-full max-w-2xl rounded-lg"
            />
          )}
          {caption && (
            <figcaption className="mt-2 text-xs text-center text-gray-300">
              {caption}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return <hr className="my-8 border-gray-600" />;

    case "table_of_contents":
      return (
        <div className="mb-6 rounded-lg border border-gray-600 bg-[#333] p-4">
          <h3 className="mb-2 font-bold text-[#dbdbdb]">목차</h3>
          <div className="text-sm text-gray-400">
            자동 생성된 목차가 여기에 표시됩니다.
          </div>
        </div>
      );

    case "bookmark":
      const bookmarkUrl = block.bookmark?.url;
      return (
        <div className="mb-4 rounded-lg border border-gray-600 bg-[#2a2a2a] p-4 hover:bg-[#333]">
          <Link
            href={bookmarkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="font-medium text-blue-400 hover:text-blue-300">
              {block.bookmark?.caption?.[0]?.plain_text || bookmarkUrl}
            </div>
          </Link>
        </div>
      );

    case "embed":
      const embedUrl = block.embed?.url;
      return (
        <div className="mb-6">
          <iframe
            src={embedUrl}
            className="w-full border rounded-lg h-96"
            allowFullScreen
          />
        </div>
      );

    case "table":
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border border-collapse">
            <tbody>
              {block.children?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="border-b">
                  {row.table_row?.cells?.map((cell: any, cellIndex: number) => {
                    const isHeader = rowIndex === 0;
                    const CellTag = isHeader ? "th" : "td";
                    return (
                      <CellTag
                        key={cellIndex}
                        className={`border px-4 py-2 text-left ${
                          isHeader
                            ? "font-bold text-[#818cf8]"
                            : "text-gray-300"
                        }`}
                      >
                        <RichText text={cell} />
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "table_row":
      // table_row는 table 내부에서 처리되므로 개별적으로는 렌더링하지 않음
      return null;

    case "column_list":
      return (
        <div className="flex flex-col gap-4 mb-6 md:flex-row">
          {block.children?.map((column: any) => (
            <div key={column.id} className="flex-1">
              <NotionRenderer blocks={column.children || []} />
            </div>
          ))}
        </div>
      );

    case "column":
      // column은 column_list 내부에서 처리되므로 개별적으로는 렌더링하지 않음
      return null;

    default:
      return (
        <div className="mb-2 rounded border border-gray-600 bg-[#333] p-2 text-sm text-gray-400">
          지원하지 않는 블록 타입: {type}
        </div>
      );
  }
}

function RichText({ text }: { text: any[] }) {
  if (!text || text.length === 0) return null;

  return (
    <>
      {text.map((value, index) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text: textContent,
          href,
        } = value;

        let element: React.ReactNode = textContent?.content || "";

        // 줄바꿈 처리
        if (typeof element === "string" && element.includes("\n")) {
          const lines = element.split("\n");
          element = lines.map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </React.Fragment>
          ));
        }

        // 스타일 적용
        if (bold) element = <strong key={index}>{element}</strong>;
        if (italic) element = <em key={index}>{element}</em>;
        if (underline) element = <u key={index}>{element}</u>;
        if (strikethrough) element = <s key={index}>{element}</s>;
        if (code) {
          element = (
            <code
              key={index}
              className="rounded border border-gray-600 bg-[#2a2a2a] px-1 py-0.5 text-xs text-[#ff6b6b]"
            >
              {element}
            </code>
          );
        }

        // 링크 적용
        if (href) {
          element = (
            <Link
              key={index}
              href={href}
              className="text-[#818cf8]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {element}
            </Link>
          );
        }

        // 색상 적용
        if (color && color !== "default") {
          const colorClass = getColorClass(color);
          element = (
            <span key={index} className={colorClass}>
              {element}
            </span>
          );
        }

        return <React.Fragment key={index}>{element}</React.Fragment>;
      })}
    </>
  );
}

function getColorClass(color: string): string {
  const colorMap: { [key: string]: string } = {
    gray: "text-gray-600",
    brown: "text-yellow-700",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    red: "text-red-600",
    gray_background: "bg-gray-200",
    brown_background: "bg-yellow-200",
    orange_background: "bg-orange-200",
    yellow_background: "bg-yellow-200",
    green_background: "bg-green-200",
    blue_background: "bg-blue-200",
    purple_background: "bg-purple-200",
    pink_background: "bg-pink-200",
    red_background: "bg-red-200",
  };

  return colorMap[color] || "";
}
