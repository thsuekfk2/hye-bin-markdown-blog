// Notion API 타입 정의

export interface RichTextContent {
  type: "text";
  text: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string | null;
}

export interface NotionFile {
  type: "file" | "external";
  file?: {
    url: string;
    expiry_time: string;
  };
  external?: {
    url: string;
  };
}

export interface NotionIcon {
  type: "emoji" | "external" | "file";
  emoji?: string;
  external?: {
    url: string;
  };
  file?: {
    url: string;
    expiry_time: string;
  };
}

// 블록 타입별 인터페이스
export interface ParagraphBlock {
  type: "paragraph";
  id: string;
  paragraph: {
    rich_text: RichTextContent[];
    color: string;
  };
  children?: NotionBlock[];
}

export interface HeadingBlock {
  type: "heading_1" | "heading_2" | "heading_3";
  id: string;
  heading_1?: {
    rich_text: RichTextContent[];
    color: string;
    is_toggleable: boolean;
  };
  heading_2?: {
    rich_text: RichTextContent[];
    color: string;
    is_toggleable: boolean;
  };
  heading_3?: {
    rich_text: RichTextContent[];
    color: string;
    is_toggleable: boolean;
  };
  children?: NotionBlock[];
}

export interface ListItemBlock {
  type: "bulleted_list_item" | "numbered_list_item";
  id: string;
  bulleted_list_item?: {
    rich_text: RichTextContent[];
    color: string;
  };
  numbered_list_item?: {
    rich_text: RichTextContent[];
    color: string;
  };
  children?: NotionBlock[];
  listNumber?: number; // 커스텀 추가 속성
}

export interface CodeBlock {
  type: "code";
  id: string;
  code: {
    caption: RichTextContent[];
    rich_text: RichTextContent[];
    language: string;
  };
}

export interface QuoteBlock {
  type: "quote";
  id: string;
  quote: {
    rich_text: RichTextContent[];
    color: string;
  };
  children?: NotionBlock[];
}

export interface CalloutBlock {
  type: "callout";
  id: string;
  callout: {
    rich_text: RichTextContent[];
    icon: NotionIcon;
    color: string;
  };
  children?: NotionBlock[];
}

export interface ImageBlock {
  type: "image";
  id: string;
  image: {
    type: "file" | "external";
    file?: {
      url: string;
      expiry_time: string;
    };
    external?: {
      url: string;
    };
    caption: RichTextContent[];
  };
}

export interface DividerBlock {
  type: "divider";
  id: string;
  divider: {};
}

export interface BookmarkBlock {
  type: "bookmark";
  id: string;
  bookmark: {
    url: string;
    caption: RichTextContent[];
  };
}

export interface EmbedBlock {
  type: "embed";
  id: string;
  embed: {
    url: string;
    caption: RichTextContent[];
  };
}

export interface TableBlock {
  type: "table";
  id: string;
  table: {
    table_width: number;
    has_column_header: boolean;
    has_row_header: boolean;
  };
  children?: TableRowBlock[];
}

export interface TableRowBlock {
  type: "table_row";
  id: string;
  table_row: {
    cells: RichTextContent[][];
  };
}

export interface ColumnListBlock {
  type: "column_list";
  id: string;
  column_list: {};
  children?: ColumnBlock[];
}

export interface ColumnBlock {
  type: "column";
  id: string;
  column: {};
  children?: NotionBlock[];
}

export interface TableOfContentsBlock {
  type: "table_of_contents";
  id: string;
  table_of_contents: {
    color: string;
  };
}

export interface UnsupportedBlock {
  type: string;
  id: string;
  [key: string]: unknown;
}

export type NotionBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListItemBlock
  | CodeBlock
  | QuoteBlock
  | CalloutBlock
  | ImageBlock
  | DividerBlock
  | BookmarkBlock
  | EmbedBlock
  | TableBlock
  | TableRowBlock
  | ColumnListBlock
  | ColumnBlock
  | TableOfContentsBlock
  | UnsupportedBlock;

export interface ListGroup {
  type: "numbered_list_item_group" | "bulleted_list_item_group";
  items: ListItemBlock[];
}

export type RenderItem = NotionBlock | ListGroup;
