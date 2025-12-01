# Storyboard

Storyboard는 개인 사용을 목적으로 하는 프로젝트입니다.

## 프로젝트 원칙

이 프로젝트는 다음 핵심 원칙을 따릅니다:

1. **코드 퀄리티 최우선**: 가독성과 유지보수성을 고려한 깨끗한 코드 작성
2. **한국어 우선 문서화**: 모든 문서와 주석은 한국어로 작성
3. **실용주의적 개발**: 과도한 추상화보다는 실제 필요한 기능 구현에 집중
4. **선택적 테스트**: 핵심 로직에 대한 테스트 작성
5. **체계적 문서화**: 구현 과정과 결정 사항 추적

자세한 내용은 [Constitution](.specify/memory/constitution.md)을 참고하세요.

## 개발 가이드

### LLM 에이전트 사용 시

Claude 등의 LLM 에이전트를 사용하여 개발할 때는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

### 기능 개발 워크플로우

1. `/speckit.specify` - 기능 스펙 작성
2. `/speckit.plan` - 구현 계획 수립
3. `/speckit.tasks` - 태스크 분해
4. `/speckit.implement` - 구현 실행

## 문서 구조

- `.specify/memory/constitution.md` - 프로젝트 헌법 및 핵심 원칙
- `CLAUDE.md` - LLM 에이전트 개발 가이드
- `.specify/templates/` - 각종 템플릿 파일들
- `specs/` - 기능별 스펙 및 계획 문서 (기능 추가 시 생성됨)

## 시작하기

프로젝트를 시작하려면 다음 명령어를 사용하여 첫 번째 기능을 정의하세요:

```bash
/speckit.specify "구현하고 싶은 기능 설명"
```

---

**참고**: 이 프로젝트는 Specify 템플릿을 기반으로 생성되었습니다.
