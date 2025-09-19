// ISR 재검증 시간 설정 (초 단위)
export const REVALIDATE_TIME = {
  // 페이지별 개별 설정 - 운영서버는 1시간(3600초)
  POSTS: process.env.NODE_ENV === "production" ? 3600 : 60,
  LOGS: process.env.NODE_ENV === "production" ? 3600 : 60,
  POST_DETAIL: process.env.NODE_ENV === "production" ? 3600 : 60,
  LOG_DETAIL: process.env.NODE_ENV === "production" ? 3600 : 60,
} as const;

// 환경변수로 오버라이드 가능
export const getRevalidateTime = (type: keyof typeof REVALIDATE_TIME) => {
  const envValue = process.env.REVALIDATE_TIME;
  if (envValue) {
    return parseInt(envValue, 10);
  }
  return REVALIDATE_TIME[type];
};
