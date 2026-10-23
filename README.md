# 나라찬 · 보안 상태 대시보드

내 계정과 PC 상태, 업무 앱 접근 판정, 최근 접속 기록과 보안 경보를 한 화면에서 확인하는 로컬 앱입니다. ALEPH 「AGI 시대의 보안 Agent 만들기」 과정의 13~16단계를 구현했습니다.

## 구현한 기능

| 영역 | 동작 |
|---|---|
| 보호 현황 | 사용자·기기·현재 세션을 표시하고 정상·주의·확인 불가를 구분합니다. |
| 업무 앱 | 서버가 반환한 허용·거부·추가 확인·확인 불가와 이유·시각을 표시합니다. |
| 보안 기록 | 최신순 목록을 종류·앱·접속 상태로 필터링하고, 기록별 근거·규칙·상태를 확인합니다. |
| 오류와 도움정보 | 로딩·빈 목록·조회 실패를 구분하고, 수동 재시도와 안전한 진단정보 복사를 제공합니다. |

화면은 매번 받은 결과로 교체합니다. 알 수 없는 상태를 정상으로 바꾸지 않으며, 미지원 조치는 비활성 안내로 표시합니다.

## 구현 범위

학생 코드는 [`on-client/student/extension.mjs`](on-client/student/extension.mjs)에 있습니다.

- `renderIdentity`: 계정·기기·세션
- `renderDecision`: 업무 앱 접근 판정
- `renderEvents`: 기록 목록·필터·상세
- `renderStatus`: 상태·알림·진단정보

공통 메뉴, API 어댑터와 앱 서버는 공식 시작 틀을 사용합니다. 학생 영역은 JavaScript ES 모듈과 `createElement`·`textContent`로 작성했습니다. 학생 코드에 추가 조회·자동 재시도·조치 요청을 넣지 않았습니다.

## 실행

Node.js 24와 PowerShell을 사용합니다. 공식 기준 버전은 24.19.0이며, 별도 npm 패키지 설치 없이 실행할 수 있습니다.

```powershell
git clone https://github.com/PeterAhnn/SKT-ALEPH-Defence-KESHEV.git
Set-Location SKT-ALEPH-Defence-KESHEV/on-client
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Demo -Port 5191
```

[http://127.0.0.1:5191/](http://127.0.0.1:5191/)에서 보호 현황·업무 앱·보안 기록을 열어 볼 수 있습니다. 예제 모드는 가상 자료를 사용하며 실제 계정 연결이 아닙니다. 실행·종료와 기본 모드는 [공식 실행 안내](on-client/docs/STUDENT_LAUNCH_GUIDE.md)에 정리돼 있습니다.

문법 검사는 `on-client` 폴더에서 `npm run check`로 실행합니다.

## 검증과 진행 상태

13~16단계 기능을 기존 공식 통과 구현과 비교하고, 모의 입력·예제 API·브라우저 조작으로 확인했습니다. 필터와 건수, 오류 후 화면 교체, 진단정보 복사와 수동 복구는 사용자도 직접 확인했습니다.

이 저장소는 비교 검증을 완료한 별도 구현입니다. 공식 통과 기록은 기존 제출본에 대한 결과이며, 이번에 비교 검증한 13~16단계 커밋은 재제출하지 않았습니다. 범위와 근거는 [검증 기록](docs/VERIFICATION.md)에 있습니다.

현재 시작 틀은 0.2.14입니다. 17단계 계정 연결은 확인 불가 상태이며, AI 연동·사건 설명 기능은 아직 완료하지 않았습니다. 비밀번호·토큰·API 키는 저장소에 포함하지 않습니다.
