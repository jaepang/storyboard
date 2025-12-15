# Claude 개발 가이드

이 문서는 Claude 및 LLM 에이전트가 Storyboard 프로젝트에서 개발 작업을 수행할 때 따라야 할 가이드라인을 정의합니다.

## 언어 사용 원칙

### 필수: 한국어 우선

**모든 문서 및 LLM 응답은 무조건 한국어로 작성해야 합니다.**

#### 한국어로 작성해야 하는 것

- 모든 프로젝트 문서 (README, spec.md, plan.md, tasks.md, 등)
- Claude의 모든 응답 및 설명
- 코드 주석 및 문서화 문자열 (docstrings)
- 커밋 메시지 (권장)
- 에러 메시지 및 로그 (권장)
- 사용자 인터페이스 텍스트

#### 영어로 작성 가능한 것

- 변수명, 함수명, 클래스명 등 코드 식별자
- 외부 라이브러리/프레임워크 사용법 (필요 시)
- 기술 용어 (괄호 안에 영어 병기 가능, 예: "의존성 주입(Dependency Injection)")

#### 예시

```python
# ✅ 올바른 예시
def calculate_user_score(user_id: str) -> float:
    """
    사용자의 점수를 계산합니다.

    Args:
        user_id: 사용자 식별자

    Returns:
        계산된 점수 값
    """
    # 사용자 데이터를 조회합니다
    user_data = fetch_user_data(user_id)

    # 점수를 계산합니다
    score = compute_score(user_data)

    return score

# ❌ 잘못된 예시
def calculate_user_score(user_id: str) -> float:
    """
    Calculate user's score.

    Args:
        user_id: User identifier

    Returns:
        Calculated score value
    """
    # Fetch user data
    user_data = fetch_user_data(user_id)

    # Calculate score
    score = compute_score(user_data)

    return score
```

## 개발 원칙

### 1. 코드 퀄리티 최우선

- 모든 코드는 읽기 쉽고 이해하기 쉬워야 함
- 복잡한 로직은 명확한 주석으로 설명
- 일관된 코딩 스타일 유지
- 불필요한 복잡성 제거 (KISS 원칙)

### 2. 실용주의적 접근

- 현재 필요한 기능에 집중
- 과도한 추상화나 미래 확장성을 위한 사전 설계 지양
- YAGNI(You Aren't Gonna Need It) 원칙 적용
- 단, 코드 퀄리티는 반드시 유지

### 3. 테스트 작성 (선택적)

- 핵심 비즈니스 로직: 테스트 필수
- 단순 CRUD: 테스트 선택적
- 외부 통합: 통합 테스트 권장

### 4. 문서화

- 모든 주요 결정사항 문서화
- 복잡한 로직은 주석으로 설명
- API 및 공개 함수는 docstring 작성

## 응답 형식

### Claude가 작업을 수행할 때

1. **현재 작업 설명**: 무엇을 하려는지 한국어로 명확히 설명
2. **코드 작성**: 필요한 코드 작성 (주석 한국어)
3. **결과 설명**: 무엇을 했는지, 왜 그렇게 했는지 한국어로 설명
4. **다음 단계 제시**: (필요시) 후속 작업이 무엇인지 안내

### 예시

```
현재 사용자 인증 기능을 구현하겠습니다.

[코드 작성]

사용자 인증을 위한 기본 함수를 작성했습니다. JWT 토큰을 사용하여
인증을 처리하며, 만료 시간은 24시간으로 설정했습니다.

다음으로 인증 미들웨어를 구현하면 API 엔드포인트에서
이 인증 시스템을 사용할 수 있습니다.
```

## Constitution 준수

모든 작업은 `.specify/memory/constitution.md`에 정의된 원칙을 따라야 합니다:

- **코드 퀄리티 최우선**
- **한국어 우선 문서화**
- **실용주의적 개발**
- **테스트 기반 개발 (선택적)**
- **문서화 및 추적성**

Constitution에 위배되는 작업이 필요한 경우, 반드시 정당한 사유를 문서화해야 합니다.

## 작업 흐름

1. **요구사항 이해**: 사용자 요청을 정확히 파악
2. **Constitution 확인**: 작업이 원칙에 부합하는지 확인
3. **계획 수립**: 어떻게 구현할지 간단히 설명
4. **구현**: 코드 작성 (한국어 주석 포함)
5. **검증**: 구현이 요구사항을 충족하는지 확인
6. **문서화**: 필요시 관련 문서 업데이트

## 금지 사항

- ❌ 영어로 문서나 응답 작성
- ❌ 불필요한 추상화나 복잡한 디자인 패턴 도입
- ❌ 요청되지 않은 과도한 최적화
- ❌ Constitution 원칙 무시
- ❌ 사용자 요구사항을 임의로 해석하거나 변경

## 권장 사항

- ✅ 명확하고 간결한 코드 작성
- ✅ 의미 있는 변수명과 함수명 사용
- ✅ 복잡한 로직은 작은 함수로 분리
- ✅ 에러 처리 적절히 구현
- ✅ 주요 결정사항 주석으로 설명
- ✅ 사용자에게 진행 상황을 명확히 전달

---

**참고**: 이 가이드는 `.specify/memory/constitution.md`의 원칙을 구체적으로 구현한 것입니다.
두 문서가 충돌하는 경우, Constitution이 우선합니다.

## Active Technologies
- TypeScript 5.x, Node.js 20.x (LTS) + Next.js 15.x, React 19.x, Supabase Client, PDF-lib (PDF 생성), React-PDF (PDF 미리보기) (001-worship-storyboard)
- Supabase (PostgreSQL 기반) + Supabase Storage (악보 파일) (001-worship-storyboard)

## Recent Changes
- 001-worship-storyboard: Added TypeScript 5.x, Node.js 20.x (LTS) + Next.js 15.x, React 19.x, Supabase Client, PDF-lib (PDF 생성), React-PDF (PDF 미리보기)
