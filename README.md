# VOXO: Cinematic Music Curation Magazine

VOXO는 단순한 음악 매거진을 넘어, 시네마틱한 다크 에스테틱과 데이터 기반의 깊이 있는 음악 큐레이션을 제공하는 프리미엄 리뷰 플랫폼입니다.

## 🎞️ Identity: Cinematic Dark
VOXO는 모노크롬(Black & White) 베이스에 에메랄드 그린 포인트를 사용하여 극도로 미니멀하면서도 세련된 시각적 경험을 제공합니다. 

- **Typography**: Oswald (Display), Montserrat (Body), Playfair Display (Serif Title)
- **Aesthetic**: Grainy Noise Overlay, Sharp Edges, High Contrast

## 🚀 Key Features
- **Neural Search Interface**: 전역 어디서나 접근 가능한 풀스크린 시네마틱 검색 시스템.
- **Premium Rating Meter**: 아티스트의 음악적 에너지를 시각화하는 다이나믹 평점 시스템.
- **Mailing List System**: 독자들과의 지속적인 소통을 위한 시네마틱 뉴스레터 구독 및 관리 기능.
- **Admin Dashboard**: 아티클 작성, 카테고리 관리, 구독자 소통이 통합된 강력한 관리 도구.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database / Auth**: Supabase
- **Styling**: Tailwind CSS v4
- **Editor**: Tiptap Rich-text Editor
- **Animation**: Framer Motion

## 📦 Getting Started

### 1. Environment Setup
`.env.local` 파일을 생성하고 다음 정보를 입력하세요:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Development
```bash
npm install
npm run dev
```

## 🏗️ Deployment & Operation
실제 서비스를 운영하기 위한 상세 가이드는 프로젝트 내 `operation_guide.md` (혹은 관련 문서)를 참조하세요. 

1. **Vercel Deploy**: GitHub 연동을 통한 자동 배포 권장.
2. **Environment Variables**: Vercel 설정에 Supabase 키 등록 필수.
3. **Middleware Security**: `/admin` 경로 보호를 위한 미들웨어가 `src/middleware.ts`에 이미 구축되어 있습니다.

---
© 2024 VOXO Editorial. All rights reserved.
