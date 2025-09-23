import Link from "next/link";

interface TagListProps {
  tags: string[];
  limit?: number;
}

export function TagList({ tags, limit }: TagListProps) {
  const displayTags = limit ? tags.slice(0, limit) : tags;

  if (tags.length === 0) {
    return null;
  }

  return (
    <section className="mx-5 mb-5">
      <div className="max-w-6xl">
        <div className="flex flex-wrap justify-center gap-2">
          {displayTags.map((tag, index) => (
            <Link
              key={tag}
              href={`/tag/${encodeURIComponent(tag)}`}
              className="rounded-full bg-gray-700 px-2 py-1 text-[11px] text-gray-300 transition-colors hover:bg-gray-600 hover:text-white"
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
