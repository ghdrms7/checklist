# 여행 준비물 체크리스트 앱 — 구현 계획

> 참고: [PRD.md](../PRD.md)
> 상태: `pending approval` (실행 승인 전)

## 0. 기술 스택 결정 (사용자 확인 완료)

| 항목 | 결정 | 비고 |
|---|---|---|
| 플랫폼 | 웹 앱 | 모바일 확장은 범위 밖 |
| 프레임워크 | Next.js (App Router, TypeScript) | 프론트+백엔드 단일 프로젝트 |
| 데이터 저장 | MongoDB (Mongoose) | 영구 저장, 서버 기반 |
| 인증 | 없음 (로그인 없음) | 개인용 전제, URL로 트립 접근 |
| DnD 라이브러리 | dnd-kit (제안) | 접근성/터치 지원 양호 |
| 스타일링 | Tailwind CSS (제안) | 빠른 개발, 별도 확인 없이 기본값 채택 |
| 데이터 페칭 | SWR (제안) | 캐시/재검증 단순화 |

## 1. Requirements Summary

- **Why**: 여행 준비물 누락 방지, 준비 상태의 직관적 관리, 반복 리스트 작성 시간 단축
- **Who**: 여행을 자주 다니는 개인, 체크리스트 기반 관리 선호자, 대량 등록이 필요한 사용자
- **User Flow**: 여행 생성 → 준비물 등록(개별/대량) → 목록 확인 → 체크박스/드래그로 상태 변경 → 수정/삭제 → 완료율 확인

## 2. 데이터 모델

```ts
// Trip
{
  _id: ObjectId,
  name: string,
  startDate: Date,
  endDate: Date,
  createdAt: Date,
}

// Item
{
  _id: ObjectId,
  tripId: ObjectId,       // ref Trip
  name: string,
  category?: string,       // P1
  priority?: 'high'|'medium'|'low', // P1
  status: 'incomplete' | 'complete',
  order: number,            // P1 수동 정렬용
  createdAt: Date,
  updatedAt: Date,
}

// Template (P1)
{
  _id: ObjectId,
  name: string,
  items: [{ name: string, category?: string }],
  createdAt: Date,
}
```

## 3. Implementation Steps

### Phase 0 — 프로젝트 셋업
- `create-next-app` (TypeScript, App Router, Tailwind) 초기화
- `lib/mongodb.ts`: Next.js 핫리로드 대응 Mongoose 싱글턴 연결 패턴 구현
- `models/Trip.ts`, `models/Item.ts` 정의
- `.env.example`에 `MONGODB_URI` 추가

### Phase 1 — Trip API (P0)
- `app/api/trips/route.ts`: GET(목록), POST(생성)
- `app/api/trips/[id]/route.ts`: GET(단건), PATCH(수정), DELETE(삭제)

### Phase 2 — Item API (P0)
- `app/api/trips/[id]/items/route.ts`: GET(목록), POST(개별 등록)
- `app/api/items/[id]/route.ts`: PATCH(이름/카테고리/status 수정), DELETE
- `app/api/trips/[id]/items/bulk/route.ts`: POST — 줄바꿈 텍스트 파싱, trim, 빈줄 제거, 기존 항목과 대소문자/공백 무시 정확 일치 중복 감지 → 중복 목록과 신규 목록 분리 반환

### Phase 3 — Trip UI (P0)
- `app/trips/page.tsx`: 여행 목록/생성 폼
- `app/trips/[id]/page.tsx`: 트립 상세 — "미완료"/"완료" 2컬럼 레이아웃

### Phase 4 — Item CRUD UI (P0)
- 개별 등록 입력 폼, 인라인 이름/카테고리 수정, 삭제 버튼(확인 다이얼로그)
- 체크박스 토글 → PATCH status, 완료 항목 취소선+색상 스타일 적용

### Phase 5 — Drag & Drop 상태 변경 (P0)
- dnd-kit `DndContext` + 두 개의 `Droppable` 컬럼(미완료/완료)
- 드롭 시 optimistic update로 즉시 UI 반영 → PATCH 호출 → 실패 시 롤백 + 에러 토스트

### Phase 6 — 대량 붙여넣기 (P0)
- 붙여넣기 텍스트 영역 + 미리보기 모달
- 미리보기에서 중복 항목 체크박스로 제외 가능
- 확정 시 bulk API 호출, 결과(등록 수/제외 수) 사용자에게 표시

### Phase 7 — 카테고리/우선순위 (P1)
- Item에 category, priority 필드 UI 추가 (등록/수정 폼 select)
- 목록 카테고리별 그룹핑, 우선순위 정렬/뱃지

### Phase 8 — 완료율 시각화 (P1)
- `(완료 항목 수 / 전체 항목 수) * 100` 계산 유틸
- 트립 상세 헤더 및 트립 목록 카드에 progress bar 표시

### Phase 9 — 다중 여행 관리 (P1)
- 트립 목록 카드에서 전환, 트립 삭제/보관

### Phase 10 — 템플릿 (P1)
- 현재 트립의 항목을 템플릿으로 저장하는 API/UI
- 신규 트립 생성 시 템플릿 선택 → 해당 항목 일괄 등록(bulk API 재사용)

### Phase 11 — 수동 순서 정렬 (P1)
- 동일 컬럼 내 dnd-kit 재정렬, `order` 필드 갱신 및 정렬 기준 반영

## 4. Acceptance Criteria (Testable)

**P0**
- [ ] 여행명+기간 입력 후 생성 시 `POST /api/trips`가 201을 반환하고 DB에 문서가 생성된다
- [ ] 준비물 이름 입력 등록 시 미완료 목록에 즉시 나타난다
- [ ] 이름/카테고리 수정 시 `PATCH /api/items/[id]`가 200을 반환하고 화면에 즉시 반영된다
- [ ] 삭제 시 `DELETE /api/items/[id]`가 204를 반환하고 목록에서 즉시 제거된다
- [ ] 체크박스 클릭 시 status가 토글되고, 완료 항목은 취소선+색상 변화로 구분 표시된다
- [ ] 미완료→완료 컬럼 드래그 시 드롭 즉시 status가 'complete'로 API에 반영된다 (역방향 동일)
- [ ] 줄바꿈 텍스트 붙여넣기 시 줄 단위로 분리되어 미리보기에 표시된다
- [ ] 기존 항목과 이름이 대소문자/공백 무시 기준으로 동일하면 중복으로 표시되고 체크박스로 제외 가능하다
- [ ] 중복 제외 후 확정하면 나머지 항목이 일괄 등록된다 (`POST /api/trips/[id]/items/bulk`)

**P1**
- [ ] 카테고리별로 준비물을 그룹핑해서 볼 수 있다
- [ ] 우선순위(상/중/하) 설정 및 정렬/필터가 동작한다
- [ ] 트립의 항목 목록을 템플릿으로 저장하고, 신규 트립 생성 시 템플릿 적용으로 항목이 일괄 등록된다
- [ ] 완료율이 `(완료/전체)*100` 계산값과 일치하는 progress bar로 표시된다
- [ ] 여행 목록에서 다른 여행으로 전환 시 해당 여행의 항목만 표시된다
- [ ] 같은 상태 컬럼 내 드래그로 순서 변경 시 새로고침 후에도 순서가 유지된다 (`order` 필드 반영)

## 5. Risks and Mitigations

| 리스크 | 완화 방안 |
|---|---|
| dnd-kit 모바일 터치 미지원 이슈 | Touch/Pointer sensor 적용 후 실제 모바일 브라우저 수동 QA |
| 대량 붙여넣기 시 빈 줄/공백 처리 누락 | trim 후 빈 문자열 필터링, 최대 등록 라인 수 제한(예: 200줄) |
| 중복 감지 기준 모호 (정확 일치 vs 유사 매칭) | 1차 범위는 trim+lowercase 정확 일치로 한정, 유사 매칭은 범위 밖으로 명시 |
| Next.js dev 환경 핫리로드 시 MongoDB 연결 누수 | `global` 캐시 기반 Mongoose 싱글턴 연결 패턴 적용 |
| 인증 부재로 인한 데이터 접근 제어 없음 | 개인용 앱 전제 명시, URL 공유 시 누구나 수정 가능함을 문서화, 인증은 향후 백로그로 분리 |
| Optimistic UI 업데이트 실패 시 상태 불일치 | 실패 시 이전 상태로 롤백 + 에러 토스트 표시 |

## 6. Verification Steps

- API route 별 happy-path + 실패 케이스 유닛 테스트 (Vitest + `mongodb-memory-server`)
- 대량 붙여넣기 dedupe 로직 유닛 테스트 (빈 줄/대소문자/공백 케이스 포함)
- 완료율 계산 유틸 유닛 테스트
- 브라우저 수동 QA: 데스크톱 마우스 D&D, 모바일 터치 에뮬레이션 D&D
- 전체 P0 플로우 E2E 수동 시나리오: 여행 생성 → 대량 등록 → 상태 변경(체크박스+드래그) → 수정/삭제 → 목록 재확인

## 7. Backlog (범위 밖, 향후 고려)

- 인증/계정 기능 (다중 사용자, 기기 간 완전 동기화)
- 유사 매칭 기반 중복 감지 (편집 거리 등)
- 오프라인 지원(PWA)
