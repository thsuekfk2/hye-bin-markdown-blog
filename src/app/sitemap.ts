import { getNotionPosts, getNotionLogs } from "@/lib/notion";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = ["", "/post", "/log"].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}${route}`,
    changefreq: "daily" as const,
    priority: 0.7,
    lastModified: new Date(),
  }));

  const posts = await getNotionPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${post.slug}`,
    changefreq: "weekly" as const,
    priority: 0.8,
    lastModified: new Date(post.date),
  }));

  const logs = await getNotionLogs();
  const logUrls: MetadataRoute.Sitemap = logs.map((log) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/log/${log.slug}`,
    changefreq: "weekly" as const,
    priority: 0.6,
    lastModified: new Date(log.date),
  }));

  return [...routes, ...postUrls, ...logUrls];
}
