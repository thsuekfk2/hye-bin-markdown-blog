# 혜빈 마크다운 블로그 🚀

**Notion 기반 컨텐츠 관리**를 지원하는 개인 블로그입니다.
Next.js 13과 Contentlayer를 기반으로 구축되었으며, AWS S3를 활용한 이미지 관리 시스템을 제공합니다.

## 주요 기능

### 📋 Notion 기반 컨텐츠 관리

- **Notion 통합**: Notion에서 작성한 글을 MDX 파일로 자동 변환
- **MDX 파일 관리**: 구조화된 컨텐츠를 `/contents/post/`와 `/contents/log/` 디렉토리에서 관리
- **slug를 이용한 동기화**: 특정 글을 선택적으로 동기화 가능

### 📝 컨텐츠

- **포스트**: `/contents/post/`에 slug 기반으로 저장되는 장문의 글
- **로그 (TIL)**: `/contents/log/YYMM/YYMMDD.mdx` 구조로 정리된 일일 학습 기록
- **캘린더 통합**: 로그 항목 탐색을 위한 인터랙티브 캘린더
- **태깅 시스템**: 컨텐츠 분류를 위한 멀티 태그 지원

### 🎨 이미지 관리

- **AWS S3 CDN**: 자동 이미지 업로드 및 CDN 서비스
- **이미지 처리**:
  - Notion 이미지 자동 다운로드 및 S3 업로드
  - 이미지 URL을 CDN 링크로 자동 변환
  - 이미지 중복 제거 및 캐싱 처리

### 🏁 동기화 스크립트

- **`sync-notion.js`**: 특정 Notion 페이지를 MDX 파일로 동기화

## 🛠️ 기술 스택

### Frontend

- **Next.js 13.4.10** with App Router
- **React 18.2.0** with TypeScript
- **Tailwind CSS 3.3.3** for styling

### External Integrations

- **Notion API** (`@notionhq/client`): 완전한 데이터베이스 통합
- **AWS S3** (`@aws-sdk/client-s3`): 이미지 저장 및 CDN

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/hye-bin-markdown-blog.git
cd hye-bin-markdown-blog
```

### 2. 의존성 설치

```bash
yarn install
# 또는
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Notion 통합
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# AWS S3 설정
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Google Analytics (선택사항)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. 개발 서버 실행

```bash
yarn dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어서 결과를 확인하세요.

## 📋 사용법

### Notion에서 글 동기화

```bash
# 특정 slug의 글을 Notion에서 MDX로 동기화
node scripts/sync-notion.js your-post-slug
```

## 📁 프로젝트 구조

```
├── src/
│   ├── app/              # Next.js App Router 페이지
│   ├── components/       # 재사용 가능한 React 컴포넌트
│   └── utils/           # 유틸리티 함수
├── contents/
│   ├── post/            # 장문 포스트 (slug.mdx)
│   └── log/             # 일일 로그 (YYMM/YYMMDD.mdx)
├── scripts/             # Notion 동기화 자동화 스크립트
├── contentlayer.config.ts # 컨텐츠 처리 설정
└── next.config.js       # Next.js 설정

```

## 🔧 컨텐츠 작성

### 포스트 (/post)

```yaml
---
title: "포스트 제목"
slug: "post-slug"
date: "2024-01-01"
description: "포스트 설명"
thumbnail: "썸네일 이미지 URL"
tags: ["tag1", "tag2"]
---
```

### 로그 (/log)

```yaml
---
title: "로그 제목"
slug: "240101"
date: "2024-01-01"
description: "로그 설명"
thumbnail: ""
tags: ["TIL", "JavaScript"]
---
```
