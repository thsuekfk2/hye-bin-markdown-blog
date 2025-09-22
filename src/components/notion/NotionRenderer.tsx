import React from "react";
import Link from "next/link";
import { NotionBlock, RenderItem } from "@/types/notion";
import {
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  CodeBlock,
  QuoteBlock,
  CalloutBlock,
  ImageBlock,
  RichText,
} from "./blocks";

interface NotionRendererProps {
  blocks: NotionBlock[];
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  // 연속된 리스트 아이템들을 그룹화하고 전체 번호 추적
  const groupedBlocks: RenderItem[] = [];
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
            type: `${currentType}_group` as
              | "numbered_list_item_group"
              | "bulleted_list_item_group",
            items: currentGroup as any[],
          });
        }
        currentGroup = [block];
        currentType = block.type;
      }
    } else {
      if (currentGroup.length > 0) {
        groupedBlocks.push({
          type: `${currentType}_group` as
            | "numbered_list_item_group"
            | "bulleted_list_item_group",
          items: currentGroup as any[],
        });
        currentGroup = [];
        currentType = null;
      }

      // heading, divider, 빈 paragraph가 나오면 번호 리셋
      if (
        block.type.startsWith("heading_") ||
        block.type === "divider" ||
        (block.type === "paragraph" &&
          (!(block as any).paragraph?.rich_text ||
            (block as any).paragraph.rich_text.length === 0))
      ) {
        numberedListCounter = 0;
      }

      groupedBlocks.push(block);
    }
  }

  // 마지막 그룹 처리
  if (currentGroup.length > 0) {
    groupedBlocks.push({
      type: `${currentType}_group` as
        | "numbered_list_item_group"
        | "bulleted_list_item_group",
      items: currentGroup as any[],
    });
  }

  return (
    <div className="notion-content">
      {groupedBlocks.map((item, index) => {
        if ("items" in item) {
          // ListGroup 처리
          if (item.type === "numbered_list_item_group") {
            return (
              <ListBlock
                key={`numbered-${index}`}
                items={item.items as any[]}
                type="numbered"
              />
            );
          } else if (item.type === "bulleted_list_item_group") {
            return (
              <ListBlock
                key={`bulleted-${index}`}
                items={item.items as any[]}
                type="bulleted"
              />
            );
          }
        }

        // 개별 블록 처리
        const blockItem = item as NotionBlock;
        return (
          <NotionBlockComponent
            key={blockItem.id || `block-${index}`}
            block={blockItem}
          />
        );
      })}
    </div>
  );
}

function NotionBlockComponent({ block }: { block: NotionBlock }) {
  const { type } = block;

  switch (type) {
    case "paragraph":
      return <ParagraphBlock block={block as any} />;

    case "heading_1":
    case "heading_2":
    case "heading_3":
      return <HeadingBlock block={block as any} />;

    case "bulleted_list_item":
    case "numbered_list_item":
      // 이제 그룹으로 처리되므로 개별적으로는 렌더링하지 않음
      return null;

    case "code":
      return <CodeBlock block={block as any} />;

    case "quote":
      return <QuoteBlock block={block as any} />;

    case "callout":
      return <CalloutBlock block={block as any} />;

    case "image":
      return <ImageBlock block={block as any} />;

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
      const bookmarkUrl = (block as any).bookmark?.url;
      return (
        <div className="mb-4 rounded-lg border border-gray-600 bg-[#2a2a2a] p-4 hover:bg-[#333]">
          <Link
            href={bookmarkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="font-medium text-blue-400 hover:text-blue-300">
              {(block as any).bookmark?.caption?.[0]?.plain_text || bookmarkUrl}
            </div>
          </Link>
        </div>
      );

    case "embed":
      const embedUrl = (block as any).embed?.url;
      return (
        <div className="mb-6">
          <iframe
            src={embedUrl}
            className="h-96 w-full rounded-lg border"
            allowFullScreen
          />
        </div>
      );

    case "table":
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse border">
            <tbody>
              {(block as any).children?.map((row: any, rowIndex: number) => (
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
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          {(block as any).children?.map((column: any) => (
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
