# 교회 찬양 인도자 / 반주자 콘티(Storyboard) 작성 및 조회 프로그램 - PRD v1

## 1. Overview
본 제품은 **교회 찬양 인도자(업로더)**가 작성하는 주간 예배 찬양 콘티(Storyboard)를 체계적으로 관리하고,  
**반주자/보컬(다운로더)**이 이를 간편하게 조회 및 PDF 형태로 다운로드할 수 있게 하는 시스템이다.

콘티는 곡 배열, 악보 파일(PDF/이미지), 송폼(sequence), BPM, 주석(벡터 드로잉),  
그리고 페이지 단위 편집 메타데이터(이미지 위치/크기/자르기/폰트 크기 등)를 포함한다.

이 PRD는 Speckit 기반 LLM 개발을 위해 작성되며, LLM이 데이터 모델·기능 흐름·렌더링 규칙을 정확히 이해할 수 있도록 서술되어 있다.

---

## 2. User Personas

### Uploader (인도자 / 관리자)
- 매주 새로운 예배 콘티를 생성한다.
- 유튜브 재생목록을 통해 초기 곡 개수를 자동 생성할 수 있다.
- 곡 정보를 입력하고 악보·송폼·BPM·주석·편집을 수행한다.
- 콘티를 최종 저장하여 반주자들과 공유한다.

### Downloader (반주자 / 보컬)
- 콘티 리스트에서 원하는 콘티를 조회·검색한다.
- 미리보기를 확인하거나 바로 PDF를 다운로드한다.

업로더와 관리자는 동일하며 별도 권한 분리는 없다.

---

## 3. User Flows

### 3.1 Uploader Flow (콘티 작성)
1. “콘티 생성” → 콘티 제목(수동 입력) + 날짜 입력
2. 유튜브 재생목록 URL 입력 (optional)
3. 영상 개수를 기반으로 초기 곡 개수 생성
4. 곡 리스트에서 제목 수정 / 순서 변경 / 추가 / 삭제
5. 각 곡별 상세 설정:
   - 악보 업로드(PDF/이미지)
   - 송폼 입력(템플릿 + 자유 입력)
   - BPM 입력(number[])
   - 주석 작성(벡터 기반 펜 드로잉)
6. 콘티 미리보기
7. 페이지 편집(크기/위치/자르기/폰트)
8. 최종 저장

### 3.2 Downloader Flow
1. 콘티 리스트 확인
2. 검색: 콘티명 / 곡명 LIKE
3. 날짜 검색(date picker)
4. 미리보기 또는 다운로드
5. 다운로드 시 실시간 PDF 렌더링

---

## 4. Functional Requirements

### 4.1 콘티
- title, date, songs(곡 배열)
- 생성/수정 시간

### 4.2 곡
- 독립적 저장 및 재사용 가능
- 악보, 송폼, BPM, 주석, 편집 메타데이터 포함

---

## 5. SongForm Specification

```ts
type SongForm = {
  name: string;
  form?: string;
};
```

- `"name (form)"` 또는 `"name"` 형태로 출력
- 배열이며 순서 중요 / 중복 가능
- 기본 템플릿: intro, inter, outro, V, C, V1~V4, C1~C4, B, T
- 자유 입력 허용

---

## 6. PDF Rendering Rules

각 페이지 요소:
- 곡 번호(index)
- 송폼 문자열 (빨간색)
- BPM (첫 페이지만, 주황색)
- 악보 이미지 또는 PDF 페이지
- 페이지 편집 메타데이터:
  - scale
  - position
  - crop
  - songFormFontSize
  - bpmFontSize

다운로드 시 실시간 렌더링(1–4초 허용).

---

## 7. Editing Metadata Specification

```ts
type PageEditMetadata = {
  pageIndex: number;
  scale: number;
  position: { x: number; y: number };
  crop?: { x: number; y: number; width: number; height: number };
  songFormFontSize: number;
  bpmFontSize: number;
};
```

곡 단위로 pages[] 형태로 저장.

---

## 8. Annotation Specification

벡터 기반 GoodNotes 스타일:

```ts
type Stroke = {
  id: string;
  color: string;
  thickness: number;
  points: { x: number; y: number }[];
};

type AnnotationLayer = Stroke[];
```

---

## 9. Search

- 콘티 제목 LIKE
- 곡 제목 LIKE (콘티 내 포함된 곡 기준)

---

## 10. Database Schema (초안)

### Conti Table
- id, title, date, timestamps

### ContiSongs Table
- contiId, songId, order

### Song Table
- id, title, bpms[], timestamps

### SongForm Table
- id, songId, name, form, order

### ScoreFile Table
- id, songId, fileUrl, fileType

### EditorMetadata Table
- id, songId, pageIndex, scale, posX, posY, cropJson, fontSizesJson

### Annotation Table
- id, songId, pageIndex, strokeJson

---

## 11. API Requirements (요약)

- POST /conti
- GET /conti
- GET /conti/:id
- GET /conti/:id/preview
- GET /conti/:id/download
- POST /song
- POST /song/:id/files
- POST /song/:id/forms
- POST /song/:id/annotations
- POST /song/:id/editor-metadata

---

## 12. Non-Functional Requirements
- 실시간 PDF 렌더링
- 파일은 오브젝트 스토리지(S3 등) 저장
- JSON 기반 편집/주석 데이터
- 곡 재사용 고려한 정규화 모델

---

## 13. Future Enhancements
- 곡 자동 추천
- BPM 자동 감지
- 고급 편집 기능
- 템플릿 기반 콘티 생성

---

## 14. Open Questions
- PDF 페이지 수가 많은 악보의 처리 성능
- 송폼이 매우 긴 경우의 UI
- 주석을 페이지 단위로 분리할지 여부
