import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { format } from "date-fns";

import rehypePrettyCode from "rehype-pretty-code";

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `post/*.mdx`,
  contentType: "mdx",
  fields: {
    date: { type: "date", required: true },
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    tags: { type: "list", of: { type: "string" } },
  },
  computedFields: {
    dateFormatted: {
      type: "string",
      resolve: (post) => format(new Date(post.date), "yy.MM.dd"),
    },
  },
}));

const Log = defineDocumentType(() => ({
  name: "Log",
  filePathPattern: `log/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true,
    },
    description: { type: "string" },
    date: {
      type: "date",
      description: "The date of the post",
      required: true,
    },
    tags: { type: "list", of: { type: "string" } },
  },
  computedFields: {},
}));

const rehypeoptions = {
  // theme: "slack-dark",
  theme: "one-dark-pro",
  keepBackground: true,
  onVisitLine(node: any) {
    if (node.children.length === 0) {
      node.children = [{ type: "text", value: " " }];
    }
  },
  onVisitHighlightedLine(node: any) {
    node.properties.className.push("highlighted");
  },
  onVisitHighlightedWord(node: any, id: any) {
    node.properties.className = ["word"];
  },
};

export default makeSource({
  contentDirPath: "contents",
  documentTypes: [Log, Post],
  mdx: {
    rehypePlugins: [[rehypePrettyCode, rehypeoptions]],
  },
});
