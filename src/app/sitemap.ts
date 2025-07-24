import { allLogs, allPosts } from "contentlayer/generated";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = ["", "/posts", "/log"].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}${route}`,
    changefreq: "daily" as const,
    priority: 0.7,
    lastModified: new Date(),
  }));

  const posts: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${post.slug}`,
    changefreq: "weekly" as const,
    priority: 0.8,
    lastModified: new Date(post.date),
  }));

  const logs: MetadataRoute.Sitemap = allLogs.map((log) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/log/${log._raw.sourceFileName.replace('.mdx', '')}`,
    changefreq: "weekly" as const,
    priority: 0.6,
    lastModified: new Date(log.date),
  }));

  return [...routes, ...posts, ...logs];
}
