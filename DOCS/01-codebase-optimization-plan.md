# VOXO 코드 최적화 계획서

## 1. 이 문서의 목적
- 기능 추가를 하기 전에, 먼저 코드 구조를 정리해서 이후 개발 속도와 안정성을 올리기 위한 기준 문서입니다.
- 지금은 "기능 부족" 문제도 있지만, 그보다 먼저 "구조가 커져서 손대기 어려운 상태"가 더 큰 리스크입니다.

## 2. 현재 진단 요약
현재 구조에서 가장 먼저 정리해야 하는 부분은 아래와 같습니다.

### 2-1. 페이지 파일이 너무 큼
- `src/app/admin/settings/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/editor/page.tsx`
- `src/app/admin/newsletter/page.tsx`
- `src/app/admin/ai-desk/page.tsx`

문제:
- 한 파일 안에 화면 UI, 상태 관리, 서버 호출, 문구, 검증 로직이 섞여 있습니다.
- 기능을 하나만 바꿔도 페이지 전체를 건드려야 합니다.
- 버그가 생겼을 때 원인을 찾기 어렵습니다.

### 2-2. 액션 파일 책임이 넓음
- `src/app/actions/newsletterActions.ts`
- `src/app/actions/settingsActions.ts`
- `src/app/actions/spotifyActions.ts`

문제:
- 데이터 조회, 저장, 이력 처리, 외부 API 호출이 한 파일에 같이 들어 있습니다.
- 테스트 포인트가 분리되지 않아 수정 영향 범위가 큽니다.

### 2-3. 관리자 문구와 운영 로직이 혼합됨
- 번역 문구
- 토스트 메시지
- 화면 표시 조건
- 설정 키 이름

문제:
- 문구 수정이 곧 코드 수정이 됩니다.
- 한글 깨짐 같은 문제가 다시 생기기 쉽습니다.

### 2-4. 편집기 기능이 실제 사용 흐름에 맞게 분리되지 않음
- 글 기본 정보
- 본문 작성
- 표지 이미지
- Spotify 연결
- 태그 선택
- 발행/임시저장

문제:
- 작성자가 한 화면에서 너무 많은 입력을 동시에 처리해야 합니다.
- 자동 기사 생성 후 후처리 흐름이 매끄럽지 않습니다.

## 3. 최적화 1차 목표
1차 목표는 "예쁘게 리팩터링"이 아니라 "기능 개발이 가능한 구조로 바꾸는 것"입니다.

완료 기준:
- 큰 페이지를 기능 단위 컴포넌트로 분리
- 반복되는 폼/토스트/검증 로직 공통화
- 설정/뉴스레터/에디터/AI 기능별 폴더 구조 정리
- 운영용 문구와 설정 키를 별도 상수로 분리
- 이후 기능 추가 시 페이지 전체가 아니라 기능 단위 파일만 수정 가능하게 만들기

## 4. 권장 폴더 구조
아래처럼 "기능 기준"으로 재구성하는 방향을 권장합니다.

```text
src/
  app/
    admin/
    api/
  components/
    common/
    layout/
  features/
    admin-dashboard/
      components/
      hooks/
      constants.ts
    admin-settings/
      components/
      hooks/
      constants.ts
    editor/
      components/
      hooks/
      schemas.ts
      utils.ts
    ai-desk/
      components/
      hooks/
    newsletter/
      components/
      hooks/
      templates.ts
    post/
      components/
    home/
      components/
  server/
    settings/
    newsletter/
    posts/
    ai/
  lib/
  providers/
  types/
```

## 5. 실제 분리 순서

### 5-1. 관리자 대시보드 분리
- 통계 카드
- 뉴스레터 상태 카드
- 설정 변경 로그 카드
- 게시글 테이블

### 5-2. 관리자 설정 분리
- 일반 설정 폼
- AI 설정 폼
- 연동 설정 폼
- 보안/점검 모드 폼

### 5-3. 에디터 분리
- 메타 정보 패널
- 본문 편집기
- 미리보기
- 발행 액션 바

### 5-4. AI Desk 분리
- 입력 폼
- 진행 상태 보드
- 결과 후처리 연결

### 5-5. 액션 레이어 정리
- 읽기 함수
- 쓰기 함수
- 외부 API 함수
- 이력 기록 함수

## 6. 최적화 작업 우선순위
1. `settings/page.tsx` 분리
2. `editor/page.tsx` 분리
3. `ai-desk/page.tsx` 분리
4. `newsletter/page.tsx` 분리
5. `spotifyActions.ts` 역할 분리
6. 관리자 공통 폼/버튼/알림 컴포넌트화

## 7. 이번 최적화에서 꼭 같이 해야 할 것
- 깨진 한글 문구 재정리
- 설정 키 상수화
- 타입 재사용 정리
- `toast` 메시지 공통화
- 페이지별 로딩/에러 상태 패턴 통일

## 8. 하지 말아야 할 것
- 기능 추가와 구조 변경을 한 번에 크게 섞지 않기
- 폴더만 바꾸고 내부 로직은 그대로 두는 식의 겉핥기 리팩터링 금지
- 에디터/AI 기능 보강 전에 또 다른 관리자 페이지를 먼저 키우지 않기

## 9. 결론
지금은 기능 추가보다 구조 최적화가 먼저입니다.
이 최적화를 먼저 끝내야, 이후 글쓰기 편의성, AI 기사 생성 보강, 공개 페이지 미완성 기능 보강을 안전하게 진행할 수 있습니다.
