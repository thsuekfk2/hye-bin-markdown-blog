# 혜빈 마크다운 블로그 🚀

**Notion을 CMS로 쓰는** 개인 블로그입니다.
Next.js 13(App Router)이 요청 시점에 Notion API를 직접 호출해 ISR로 렌더링하며, AWS S3로 이미지를 캐싱합니다.

## 주요 기능

### 📋 Notion 기반 컨텐츠

- **Notion 통합**: 글 작성/발행을 Notion 데이터베이스에서 관리
- **ISR 렌더링**: 빌드 시 정적 생성 + `revalidate` 주기로 자동 갱신
- **포스트 / 로그(TIL)**: `Category` 속성으로 구분

## 🛠️ 기술 스택

### Frontend

- **Next.js 13** with App Router
- **React 18** with TypeScript
- **Tailwind CSS**

### External Integrations

- **Notion API** (`@notionhq/client`, `notion-to-md`): 데이터베이스 조회 및 페이지 콘텐츠를 마크다운으로 변환
- **AWS S3** (`@aws-sdk/client-s3`): 이미지 저장 및 CDN
- **Shiki**: 코드 블록 신택스 하이라이팅

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/thsuekfk2/hye-bin-markdown-blog.git
cd hye-bin-markdown-blog
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Notion 통합
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id

# AWS S3 설정
S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Google Analytics (선택사항)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어서 결과를 확인하세요.

## 📋 Notion 데이터베이스 스키마

`getPostsByTag` 등이 참조하는 속성 이름은 Notion 쪽과 정확히 일치해야 합니다 (`src/lib/notion.ts`):

| Notion 속성 | 타입         | 설명                      |
| ----------- | ------------ | ------------------------- |
| 이름        | Title        | 글 제목                   |
| Slug        | Rich text    | URL 경로 (`/post/{slug}`) |
| Date        | Date         | 게시일                    |
| Description | Rich text    | 목록/메타 설명            |
| Thumbnail   | Files        | 썸네일 이미지             |
| Status      | Select       | `발행`이어야 노출됨       |
| Category    | Select       | `post` 또는 `log`         |
| Tags        | Multi-select | 태그 목록                 |

## 📁 프로젝트 구조

```
├── src/
│   ├── app/              # Next.js App Router 페이지 (post, log, tag, api)
│   ├── components/       # 재사용 가능한 React 컴포넌트
│   ├── lib/               # Notion 조회, S3 업로드, 메타데이터 등 핵심 로직
│   ├── hooks/            # React 훅
│   └── utils/            # 유틸리티 함수
└── next.config.js        # Next.js 설정
```
