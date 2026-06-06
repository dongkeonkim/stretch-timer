# Stretch Timer (스트레칭 타이머)

설정한 간격마다 일어나서 스트레칭하라고 알려주는 가벼운 **macOS 메뉴바 앱**. 메뉴바에 다음 알림까지 남은 시간이 카운트다운으로 표시된다.

## 기능

- 메뉴바 카운트다운 타이머
- 알림 간격 설정 (기본 30분)
- 활성 시간대 설정 (기본 9시~19시) — 그 외 시간에는 자동으로 `비활성`
- 시간이 되면 macOS 알림 + Dock 바운스로 알림
- 트레이·Dock 메뉴에서 시작 / 정지 / 리셋 / 설정
- electron-builder로 macOS DMG 빌드

## 요구 사항

- macOS (메뉴바·Dock·네이티브 알림에 의존)
- Node.js + npm

## 개발 / 실행

```bash
npm install
npm start
```

## 빌드

```bash
npm run build
```

macOS DMG 결과물은 `dist/`에 생성된다.

## 구조

```
main.js          Electron 메인 프로세스 — 트레이·타이머·알림·설정 IPC
settings.html    간격·활성 시간대 설정 창
icon.png         Dock 아이콘
package.json     앱 메타데이터 + electron-builder 빌드 설정
```

## 기술 스택

- Electron
- electron-builder (macOS DMG 패키징)
