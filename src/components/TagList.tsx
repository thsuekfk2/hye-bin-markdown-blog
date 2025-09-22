import Link from "next/link";

interface TagListProps {
  tags: string[];
  title?: string;
  limit?: number;
}

export function TagList({ tags, title = "태그", limit }: TagListProps) {
  const displayTags = limit ? tags.slice(0, limit) : tags;

  if (tags.length === 0) {
    return null;
  }

  return (
    <section className="mx-5 mb-5">
      <div className="max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          {limit && tags.length > limit && (
            <span className="text-xs text-gray-400">
              {tags.length}개 태그 중 {limit}개 표시
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag, index) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="animate-slide-up rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300 opacity-0 transition-all duration-300 hover:scale-105 hover:bg-gray-600 hover:text-white"
              style={{
                animationDelay: `${index * 50 + 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
