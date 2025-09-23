import Link from "next/link";

interface TagProps {
  tag: string;
  size?: "sm" | "md";
  variant?: "default" | "compact";
}

export function Tag({ tag, size = "sm", variant = "default" }: TagProps) {
  const sizeClasses = {
    sm: "text-[11px] px-2 py-1",
    md: "text-xs px-3 py-1",
  };

  const variantClasses = {
    default: "rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white",
    compact: "rounded bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white",
  };

  return (
    <Link
      href={`/tag/${encodeURIComponent(tag)}`}
      className={`transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      #{tag}
    </Link>
  );
}