// ISR 재검증 시간 설정 (초 단위)
export const ISR_TIME = process.env.NODE_ENV === "production" ? 3600 : 60;
