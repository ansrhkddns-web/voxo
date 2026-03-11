# Spotify 로그인 연동 체크 가이드

## 목적
게시글 하단 Spotify 저장 기능이 정상적으로 동작하도록 필요한 설정을 한 번에 점검하는 문서입니다.

이 기능으로 가능한 동작은 아래와 같습니다.

- 로그인 안 된 사용자는 `Login` 버튼 표시
- 로그인된 사용자는 저장 여부에 따라 `+` 또는 체크 표시
- `+` 버튼으로 현재 곡을 Spotify 보관함에 저장

## 필요한 환경변수
프로젝트 실행 환경에 아래 값이 있어야 합니다.

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`

## 권장 Redirect URI
실서버 주소가 `https://voxo-omega.vercel.app` 라면 아래 주소를 그대로 사용합니다.

- `https://voxo-omega.vercel.app/api/spotify/callback`

로컬 테스트용으로는 아래 주소도 함께 등록해두는 것이 좋습니다.

- `http://localhost:4000/api/spotify/callback`

## Spotify Dashboard에서 확인할 항목
Spotify Developer Dashboard의 앱 설정에서 Redirect URI 목록에 아래 주소들이 실제로 등록되어 있어야 합니다.

- 실서버 주소
- 로컬 테스트 주소

예시:

- `https://voxo-omega.vercel.app/api/spotify/callback`
- `http://localhost:4000/api/spotify/callback`

## 동작 확인 순서
1. 게시글 상세 페이지로 이동합니다.
2. 하단 Spotify 바에 `Login` 버튼이 보이는지 확인합니다.
3. 로그인 후 다시 같은 페이지로 돌아오는지 확인합니다.
4. 저장되지 않은 곡이면 `+` 버튼이 보이는지 확인합니다.
5. `+` 버튼을 누른 뒤 체크 표시로 바뀌는지 확인합니다.

## 자주 발생하는 문제
### `INVALID_CLIENT: Invalid redirect URI`
원인:

- Spotify Dashboard에 등록된 Redirect URI와 실제 요청 주소가 다름

확인할 것:

- `SPOTIFY_REDIRECT_URI` 값
- Vercel 실서버 도메인
- Spotify Dashboard의 Redirect URI 목록

### 로그인은 되는데 저장이 안 되는 경우
원인:

- 로그인 권한 동의가 제대로 끝나지 않았거나 세션이 만료됨

확인할 것:

- 다시 로그인 시도
- 브라우저 쿠키 차단 여부
- `user-library-read`, `user-library-modify` 권한 포함 여부

## 운영 권장사항
- 실서버와 로컬 Redirect URI를 모두 등록합니다.
- 실서버 배포 후 실제 계정으로 저장 테스트를 한 번 진행합니다.
- 저장 성공 후 체크 표시가 보이는지 확인합니다.
