import path from "path";
import { remark } from "remark";
import html from "remark-html";
import fs from "fs";
import matter from "gray-matter";

export const filePath = path.join(process.cwd(), "src", "__posts");

export const getTagsData = () => {
  const files = fs.readdirSync(filePath);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(`src/__posts/${fileName}`, "utf8");
    const matterResult = matter(fileContents);
    return matterResult.data.tags;
  });

  return Array.from(new Set(posts.flat()));
};

export const getPostContent = async (id: string) => {
  const content = fs.readFileSync(`${filePath}/${id}.md`);
  const matterResult = matter(content);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    contentHtml,
    ...matterResult.data,
  };
};

export const getPostMetadata = () => {
  const files = fs.readdirSync(filePath);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(`src/__posts/${fileName}`, "utf8");
    const matterResult = matter(fileContents);
    return {
      title: matterResult.data.title,
      date: matterResult.data.date,
      subtitle: matterResult.data.subtitle,
      slug: fileName.replace(".md", ""),
    };
  });

  return posts;
};
