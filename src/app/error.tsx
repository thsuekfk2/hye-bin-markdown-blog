"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">일시적인 오류가 발생했어요</h1>
      <p className="text-sm text-gray-400">잠시 후 다시 시도해 주세요.</p>
      <button
        onClick={reset}
        className="rounded-full bg-[#444] px-4 py-2 text-sm transition-colors hover:bg-[#555]"
      >
        다시 시도
      </button>
    </div>
  );
}
