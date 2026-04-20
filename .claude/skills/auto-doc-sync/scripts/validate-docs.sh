#!/usr/bin/env bash
# validate-docs.sh — docs/ 문서 누락·품질 점검 스크립트
# 사용법: bash .claude/skills/auto-doc-sync/scripts/validate-docs.sh
# 목적:   src/mocks/와 docs/의 1:1 대응 검증 + 각 문서 품질 확인

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
MOCKS_DIR="$ROOT/src/mocks"
DOCS_DIR="$ROOT/docs"

PASS=0
FAIL=0
WARN=0

ok()   { echo "  ✅ $1"; ((PASS++)); }
fail() { echo "  ❌ $1"; ((FAIL++)); }
warn() { echo "  ⚠️  $1"; ((WARN++)); }
info() { echo ""; echo "── $1 ──────────────────────────────────────"; }

# ─────────────────────────────────────────────────────────────────────────────
info "1. docs/ 폴더 존재 여부"

if [[ -d "$DOCS_DIR" ]]; then
  ok "docs/ 폴더 존재"
else
  fail "docs/ 폴더 없음 — 프로젝트 루트에 docs/ 폴더 생성 필요"
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
info "2. src/mocks/ ↔ docs/ 1:1 대응 검증"

if [[ ! -d "$MOCKS_DIR" ]]; then
  warn "src/mocks/ 폴더 없음 — Mock 개발 모드 미적용 프로젝트일 수 있음"
else
  for mock_file in "$MOCKS_DIR"/*.js; do
    [[ -f "$mock_file" ]] || continue

    domain="$(basename "$mock_file" .js)"
    doc_file="$DOCS_DIR/${domain}.md"

    if [[ -f "$doc_file" ]]; then
      ok "mocks/${domain}.js ↔ docs/${domain}.md"
    else
      fail "mocks/${domain}.js 에 대응하는 docs/${domain}.md 없음 (Rule 12 위반)"
    fi
  done
fi

# ─────────────────────────────────────────────────────────────────────────────
info "3. docs/ 고아 파일 검사 (코드 없는 문서)"

for doc_file in "$DOCS_DIR"/*.md; do
  [[ -f "$doc_file" ]] || continue

  domain="$(basename "$doc_file" .md)"
  mock_file="$MOCKS_DIR/${domain}.js"

  if [[ -f "$mock_file" ]]; then
    : # 정상
  else
    warn "docs/${domain}.md 에 대응하는 mocks/${domain}.js 없음 — 도메인 삭제 후 문서가 남아있을 수 있음"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
info "4. 각 docs/*.md 필수 섹션 검증"

REQUIRED_HEADINGS=("## 1\." "## [0-9]\.")

for doc_file in "$DOCS_DIR"/*.md; do
  [[ -f "$doc_file" ]] || continue

  name="$(basename "$doc_file")"
  errors=0

  # 필수 섹션 존재 여부
  if ! grep -q "## 1\." "$doc_file"; then
    fail "${name}: 데이터 구조(## 1.) 섹션 없음"
    ((errors++))
  fi

  if ! grep -qiE "API|엔드포인트|endpoint" "$doc_file"; then
    fail "${name}: API 엔드포인트 섹션 없음"
    ((errors++))
  fi

  if ! grep -qi "Mock\|mock" "$doc_file"; then
    warn "${name}: Mock 데이터 설명 없음"
  fi

  # 비즈니스 정책 수치 존재 여부 (숫자 포함된 줄이 충분히 있는지)
  num_count=$(grep -cP '\d{2,}' "$doc_file" 2>/dev/null || echo "0")
  if [[ "$num_count" -lt 3 ]]; then
    warn "${name}: 비즈니스 수치(금액, 비율, 제한 수치 등)가 부족할 수 있음"
  fi

  # 코드 위치 참조 여부
  if ! grep -q "src/" "$doc_file"; then
    warn "${name}: 코드 위치(src/...) 참조 없음 — 상수·함수 위치 기술 권장"
  fi

  if [[ $errors -eq 0 ]]; then
    ok "${name}: 필수 섹션 충족"
  fi
done

# ─────────────────────────────────────────────────────────────────────────────
info "5. constants.js 비즈니스 상수 ↔ docs/ 동기화 확인"

CONSTANTS_FILE="$ROOT/src/utils/constants.js"

if [[ -f "$CONSTANTS_FILE" ]]; then
  # 주요 상수가 docs에 언급되어 있는지 확인
  declare -A CONST_DOC_MAP=(
    ["SHIPPING_FREE_THRESHOLD"]="docs/orders.md"
    ["SHIPPING_FEE"]="docs/orders.md"
    ["POINT_EARN_RATE"]="docs/points.md"
    ["REVIEW_POINT_TEXT"]="docs/reviews.md"
    ["REVIEW_POINT_PHOTO"]="docs/reviews.md"
    ["MAX_ADDRESSES"]="docs/user.md"
  )

  for const_name in "${!CONST_DOC_MAP[@]}"; do
    target_doc="${CONST_DOC_MAP[$const_name]}"
    full_doc_path="$ROOT/$target_doc"

    if ! grep -q "^export const $const_name" "$CONSTANTS_FILE" 2>/dev/null; then
      warn "constants.js: $const_name 미정의 — 추가 필요하거나 이름이 변경됨"
      continue
    fi

    if [[ -f "$full_doc_path" ]]; then
      # 상수의 실제 값을 constants.js에서 추출
      const_value=$(grep "^export const $const_name" "$CONSTANTS_FILE" | grep -oP '[\d.]+' | head -1 || echo "")

      if [[ -n "$const_value" ]] && grep -q "$const_value" "$full_doc_path" 2>/dev/null; then
        ok "$const_name ($const_value) ↔ $target_doc 동기화 확인"
      else
        warn "$const_name 의 값($const_value)이 $target_doc 에 명시되지 않았을 수 있음"
      fi
    else
      warn "$target_doc 없음 — $const_name 문서화 누락"
    fi
  done
else
  warn "src/utils/constants.js 없음 — 상수 파일 확인 필요"
fi

# ─────────────────────────────────────────────────────────────────────────────
info "6. mockBaseQuery.js 도메인 ↔ docs/ 확인"

MOCK_QUERY="$ROOT/src/api/mockBaseQuery.js"

if [[ -f "$MOCK_QUERY" ]]; then
  # handleRequest 내 라우트 블록 도메인 추출 (// ── DomainName 패턴)
  while IFS= read -r domain_title; do
    # 제목 → 소문자 추정 (Auth → auth, Products → products 등)
    domain_lower="${domain_title,,}"

    # 일부 복수형 → 단수형 변환 시도
    domain_singular="${domain_lower%s}"   # 끝의 s 제거 (단순 추정)

    if [[ -f "$DOCS_DIR/${domain_lower}.md" ]]; then
      ok "mockBaseQuery 도메인 '${domain_title}' ↔ docs/${domain_lower}.md"
    elif [[ -f "$DOCS_DIR/${domain_singular}.md" ]]; then
      ok "mockBaseQuery 도메인 '${domain_title}' ↔ docs/${domain_singular}.md"
    else
      warn "mockBaseQuery '${domain_title}' 도메인에 대응하는 docs 파일 없음"
    fi
  done < <(grep -oP '(?<=// ── )[A-Za-z]+' "$MOCK_QUERY" 2>/dev/null || true)
else
  warn "src/api/mockBaseQuery.js 없음"
fi

# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo " 검증 결과"
echo " ✅ 통과: ${PASS}개"
echo " ⚠️  경고: ${WARN}개"
echo " ❌ 실패: ${FAIL}개"
echo "════════════════════════════════════════════════"

if [[ $FAIL -gt 0 ]]; then
  echo ""
  echo "❌ 실패 항목이 있습니다."
  echo "   누락된 docs/*.md를 생성하거나 auto-doc-sync/template.md를 참고하여 문서를 작성하세요."
  echo ""
  echo "   실행: bash .claude/skills/auto-doc-sync/scripts/validate-docs.sh"
  exit 1
elif [[ $WARN -gt 0 ]]; then
  echo ""
  echo "⚠️  경고 항목을 검토하고 필요 시 문서를 보강하세요."
  exit 0
else
  echo ""
  echo "🎉 모든 문서가 최신 상태입니다!"
  exit 0
fi
