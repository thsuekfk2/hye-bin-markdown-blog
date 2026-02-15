// ISR 재검증 시간 설정 (초 단위)
export const ISR_TIME = process.env.NODE_ENV === "production" ? 3600 : 60;

// 페이지네이션 설정
export const PAGINATION = {
  posts: 4,
  logs: 11,
  recent: 4,
} as const;

// 이미지 설정
export const IMAGE = {
  fallback: "/jump.webp",
  defaultWidth: 800,
  defaultHeight: 300,
} as const;
