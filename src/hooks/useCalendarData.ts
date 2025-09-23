"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ArticleData {
  date: string;
  slug: string;
  type: "post" | "log";
  title: string;
}

export function useCalendarData(filterType: "post" | "log" | "all" = "all") {
  const [availableDates, setAvailableDates] = useState<Map<string, ArticleData[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles");
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }

        const articles = await response.json();
        const dateMap = new Map<string, ArticleData[]>();

        articles.forEach((article: any) => {
          if (article.date) {
            const formatDate = format(new Date(article.date), "yyMMdd");
            const articleData: ArticleData = {
              date: article.date,
              slug: article.slug,
              type: article.type,
              title: article.title,
            };

            if (dateMap.has(formatDate)) {
              dateMap.get(formatDate)!.push(articleData);
            } else {
              dateMap.set(formatDate, [articleData]);
            }
          }
        });

        setAvailableDates(dateMap);
      } catch (error) {
        console.error("Error fetching calendar dates:", error);
        setAvailableDates(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, []);

  const getArticlesForDate = (date: Date): ArticleData[] => {
    const formatDate = format(date, "yyMMdd");
    const articles = availableDates.get(formatDate) || [];
    
    if (filterType === "all") {
      return articles;
    }
    
    return articles.filter(article => article.type === filterType);
  };

  const isArticleAvailable = (date: Date): boolean => {
    return getArticlesForDate(date).length > 0;
  };

  return {
    getArticlesForDate,
    isArticleAvailable,
    loading
  };
}