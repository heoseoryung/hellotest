---
name: doc-sync
description: 문서 동기화 규칙. 비즈니스 로직 변경 시 docs/domain·view 자동 갱신 필수, 코드 전 docs 먼저 업데이트(절대 원칙), 완료 보고 시 코드+문서 변경 내역 함께 보고. 모든 작업에 항상 적용.
---

# 문서 동기화 규칙

- **Auto-Doc Sync** — 비즈니스 로직(배송비, 포인트율, 상태값, 카테고리 등) 변경 시 `docs/domain/*.md` 또는 `docs/view/*.md` 자동 갱신 필수.
- **Docs First (절대 원칙)** — 코드 한 줄 작성 전에 반드시 관련 docs 파일을 먼저 업데이트한다. 변경의 크기(대·소)와 무관하게 예외 없이 적용. 순서를 어기면 규칙 위반이다:
    1. 관련 `docs/domain/*.md` 또는 `docs/view/*.md` 읽기 → 명세 파악
    2. docs 파일 업데이트 또는 신규 생성
    3. 코딩 시작
- **Change Report** — 완료 보고 시 수정된 코드와 문서(`docs/domain/`, `docs/view/`) 변경 내역을 함께 보고.
- **New Domain Doc** — 신규 도메인 추가 시 코딩 전에 `docs/domain/{domain}.md`를, 신규 뷰(레이아웃·복합 페이지) 추가 시 `docs/view/{view}.md`를 신규 생성하여 비즈니스 로직을 먼저 정의할 것. 기존 docs 업데이트만으로는 불충분.
