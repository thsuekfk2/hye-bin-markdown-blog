import { allLogs, allPosts } from "contentlayer/generated";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = ["", "/posts", "/log"].map((route) => ({
    url: `https://hyebin.info${route}`,
    changefreq: "daily",
    priority: 0.7,
    lastModified: new Date(),
  }));

  const posts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `https://hyebin.info/post/${post.title}`,
    changefreq: "daily",
    priority: 0.7,
    lastModified: new Date(post.date),
  }));

  const logs: MetadataRoute.Sitemap = allLogs.map((log) => ({
    url: `https://hyebin.info/log/${log._raw.sourceFileName.split(".")[0]}`,
    changefreq: "daily",
    priority: 0.7,
    lastModified: new Date(log.date),
  }));

  return [...routes, ...posts, ...logs];
}
