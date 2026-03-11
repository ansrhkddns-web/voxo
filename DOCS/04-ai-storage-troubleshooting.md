# AI Storage Troubleshooting

## 증상

- AI Auto Desk에서 초안 생성은 진행되지만 마지막 저장 단계에서 실패함
- 관리자 기본 로그인으로는 글 저장이 되는데 AI 저장은 막히는 것처럼 보임

## 가장 가능성 높은 원인

이 프로젝트는 관리자 로그인에 자체 쿠키 방식을 사용합니다.
반면 Supabase 데이터베이스의 쓰기 권한은 별도 권한 정책을 따릅니다.

그래서 아래 조건이 겹치면 저장이 실패할 수 있습니다.

- Supabase 실제 사용자 로그인은 없음
- 기본 관리자 로그인만 사용 중
- `SUPABASE_SERVICE_ROLE_KEY`가 `.env.local`에 없음

## 해결 방법

`.env.local`에 아래 값을 추가합니다.

```env
SUPABASE_SERVICE_ROLE_KEY=여기에_서비스_롤_키
```

추가 후 개발 서버를 다시 실행합니다.

```bash
npm run dev:4000
```

## 키 위치

Supabase 대시보드에서 아래 경로로 확인할 수 있습니다.

- `Project Settings`
- `API`
- `service_role`

주의:
- `anon key`가 아니라 `service_role key`를 넣어야 합니다.
- 이 값은 서버 전용이므로 외부에 노출하면 안 됩니다.

## 현재 코드 대응

현재 코드는 아래처럼 동작합니다.

- Supabase 사용자 로그인 상태가 있으면 일반 쓰기 경로 사용
- 기본 관리자 로그인만 있으면 `SUPABASE_SERVICE_ROLE_KEY` 우선 사용
- 서비스 롤 키가 없으면 원인을 더 명확한 오류 메시지로 안내

## 확인 체크리스트

- `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY`가 들어갔는지
- 개발 서버를 재시작했는지
- 관리자에서 다시 AI 초안 생성을 실행했는지
- 저장 후 `/admin/editor?id=...`로 이동하는지
