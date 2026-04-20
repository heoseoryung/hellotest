# {{DOMAIN_TITLE}} ({{Domain}}) 도메인 명세

<!-- 이 템플릿을 복사하여 docs/{domain}.md를 생성한다. -->
<!-- {{PLACEHOLDER}}를 실제 내용으로 교체. 해당 없는 섹션은 삭제. -->

## 1. 데이터 구조

```js
{
  id: Number,                 // 고유 ID
  // {{FIELD}}: {{TYPE}},     // {{설명}}
  createdAt: String,          // ISO 8601
  updatedAt: String,          // ISO 8601
}
```

---

## 2. 상태값 (해당하는 경우)

| 상태값 | 표시명 | 설명 |
|---|---|---|
| `"{{status}}"` | {{표시명}} | {{설명}} |

**코드 위치:** `src/utils/constants.js` → `{{DOMAIN_UPPER}}_STATUS`

### 상태 전이 규칙
- {{상태 A}}에서만 {{액션}} 가능
- {{상태 B}} 이후는 {{제한}}

---

## 3. 비즈니스 정책

<!-- 수치와 계산식을 정확히 기술. 코드 위치 명시. -->

### {{정책명}}
| 조건 | 결과 |
|---|---|
| {{조건}} | {{결과}} |

```js
// 계산식 (코드 위치: src/utils/formatters.js → calc{{Something}}())
{{result}} = {{계산식}}
```

**코드 위치:** `src/utils/constants.js` → `{{CONSTANT_NAME}}`

---

## 4. API 엔드포인트

| Method | URL | 인증 | 설명 |
|---|---|---|---|
| `GET` | `/{{domain}}s` | 필요 | 목록 조회 |
| `GET` | `/{{domain}}s/:id` | 필요 | 단건 조회 |
| `POST` | `/{{domain}}s` | 필요 | 생성 |
| `PATCH` | `/{{domain}}s/:id` | 필요 | 수정 |
| `DELETE` | `/{{domain}}s/:id` | 필요 | 삭제 |

### 쿼리 파라미터 (목록 조회)
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `{{param}}` | {{Type}} | {{설명}} |

---

## 5. Mock 데이터 (`src/mocks/{{domain}}.js`)

- 초기 **{{N}}개** 항목 ({{불변|가변}} 데이터)
- {{가변인 경우: `mockBaseQuery.js`가 모듈 레벨 `let {{domain}}s` 변수로 복사하여 관리}}
- {{가변인 경우: `src/mocks/{{domain}}.js` 원본 배열 직접 변경 금지}}

---

## 6. RTK Query 태그 전략

| 태그 | 생성 엔드포인트 | 무효화 엔드포인트 |
|---|---|---|
| `{ type: '{{Domain}}', id: 'LIST' }` | `get{{Domain}}s` | `create{{Domain}}`, `delete{{Domain}}` |
| `{ type: '{{Domain}}', id }` | `get{{Domain}}` | `update{{Domain}}`, `delete{{Domain}}` |

**코드 위치:** `src/api/{{domain}}Api.js`

### 연관 도메인 무효화 (있는 경우)
- {{액션}} 시 `{{ '연관도메인' }}` 태그도 함께 무효화 — {{이유}}
