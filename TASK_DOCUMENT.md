# VOXO 프로젝트 진행 상황 및 Task 정의 문서

현재 코드베이스(`g:\AntigravityProject\Voxo\voxo-project`)를 분석하여 파악한 구현 완료된 기능, 미완료된 과제 및 향후 고도화 계획입니다.

---

## 🟢 1. 현재까지 진행된 작업 (Work Completed)

### 핵심 인프라 및 환경 설정
- **프레임워크**: Next.js 15 (App Router 기반) 및 Tailwind CSS v4 세팅 완료.
- **데이터베이스/인증**: Supabase 연동 (Database Schema 구성 및 테이블 구축 완료).
- **디자인 시스템**: 'Cinematic Dark' 테마 적용 (모노크롬 베이스 + 에메랄드 그린 포인트, 그래인(Grain) 노이즈 오버레이 및 전용 폰트).

### 주요 기능 단위
- **메인 플랫폼 UI**:
  - `Hero`, `Marquee`, `PostCard` 컴포넌트를 통한 메인 홈 렌더링.
  - 글로벌 검색 기능 (`SearchOverlay.tsx`)을 통한 `searchPosts` 액션 연동 완료.
- **포스트(아티클) 시스템**:
  - 다이나믹 라우팅 (`/post/[slug]`) 및 SSR/DB 조회 구동 완료.
  - `ArtistStats` 및 `RatingMeter` (평점 시스템) 컴포넌트 마운트 및 정보 출력.
- **Spotify 인테그레이션**:
  - Spotify 공식 API 403 대응용 **Robust Scraper** 구현 완료 (`spotifyActions.ts`).
  - 팔로워, 월별 청취자, 메타 장르 및 탑 트랙 데이터 파싱 후 UI 에 출력 지원.
  - `SpotifyEmbed` 플레이어 연동.
- **Admin 대시보드 (`/admin`)**:
  - 통계 요약 (Analytics Grid) 및 아티클 목록 뷰 구현.
  - 삭제(`deletePost`), 공개/비공개(`is_published`) 상태 확인 구현.
  - **콘텐츠 에디터 (`/admin/editor`)**: Tiptap 기반 Rich-Text 편집, 커버 이미지 Supabase Storage 업로드, 자동 Slug 생성 및 포스트 배포 통합.

---

## 🟡 2. 완료되지 않은 작업 (Incomplete / Pending Tasks)

- **뉴스레터(Mailing List) 발송 시스템**:
  - *현황*: 구독 폼(`<NewsletterForm />`) UI 및 `subscribers` DB 테이블은 존재함.
  - *과제*: 가입한 구독자들에게 실제 이메일을 발송하기 위한 외부 시스템 (Resend, SendGrid 등) 연동과, Admin 내에서 이를 관리할 수 있는 `/admin/subscribers` 관리 페이지 활성화.
- **전용 카테고리 관리 페이지**:
  - *현황*: 현재 에디터에서 카테고리를 선택하고 매핑할 수 있음.
  - *과제*: Admin 대시보드에서 카테고리(분류)를 추가/수정/삭제 할 수 있는 직관적인 UI (`/admin/categories`) 구축.
- **포스트 상세 페이지 (`/post/[slug]`)의 동적 메타데이터(SEO) 처리**:
  - *현황*: 화면은 렌더링되나 Next.js의 `generateMetadata` 설정 관련 기능 최적화 미비.
- **로그인/권한 보호 정밀화**:
  - *현황*: `middleware.ts` 등을 이용해 Admin 라우팅 보호는 되어있으나, 에러가 났을 때 보여주는 로그인 UI나 사용자 피드백 페이지 디테일 추가 필요.

---

## 🚀 3. 고도화 계획 (Future Enhancement Plans)

### 3.1. 사용자 경험(UX) 및 인터랙션 강화
- **Framer Motion 애니메이션 심화**:
  - 페이지 전환 간(Page Transitions) 자연스러운 시네마틱 페이드인/아웃.
  - 스크롤 시 텍스트 및 이미지가 나타나는 Parallax 효과 추가.
- **스켈레톤(Skeleton) 및 낙관적 UI(Optimistic UI) 업데이트**:
  - 데이터 통신이나 Spotify Scraper가 작동하는 동안 빈 화면이나 `Loader2` 대신, 레이아웃을 미리 보여주는 아름다운 스켈레톤 로딩 구현.

### 3.2. 데이터 및 플랫폼 안정성
- **Spotify 데이터 캐싱 강화**:
  - Scraper에 의존하므로 잦은 요청 시 Spotify에서 차단 (Rate-Limiting) 될 우려가 있음. Vercel KV나 Redis를 통한 메모리 캐싱, 또는 Supabase 테이블 내 캐시 저장소 구축 파이프라인.
- **Edge Case 대응 로직 보완**:
  - 존재하지 않는 url 접근 (404 Not Found), 서버 에러 (500) 시 나타나는 에러 뷰를 프로젝트의 Identity(Cinematic Dark)에 맞게 개편.

### 3.3. 백엔드 및 확장성
- **추천 알고리즘 도입**:
  - 아티클 끝에 관련된 글을 보여주는 'You May Also Like' 기능을 위해 태그(`tags`)나 `category_id` 기반 추천 알고리즘 로직 구현.
- **조회수 및 읽음 통계 고도화**:
  - Admin Dashboard의 'Avg Read Time' / 'Views' 트래킹을 위한 로그 분석 기능(Vercel Analytics 확장 또는 Supabase Function) 연동.
