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
    default: "rounded-full bg-[#5555]",
    compact: "rounded bg-[#5555]",
  };

  return (
    <Link
      href={`/tag/${tag}`}
      className={`transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      #{tag}
    </Link>
  );
}
