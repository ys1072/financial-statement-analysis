# 배포 가이드

## Vercel 배포 방법

### 방법 1: Vercel 웹 대시보드 사용 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - GitHub 계정으로 로그인

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 선택: `ys1072/financial-statement-analysis`
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: Next.js (자동 감지됨)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

4. **환경 변수 설정**
   - "Environment Variables" 섹션에서 다음 변수 추가:
     - `OPENDART_API_KEY`: 오픈다트 API 키
     - `GEMINI_API_KEY`: Gemini API 키
   - 각 환경(Production, Preview, Development)에 적용

5. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 URL 확인

### 방법 2: Vercel CLI 사용

만약 CLI 오류가 해결되면:

```bash
# 1. 환경 변수 설정
vercel env add OPENDART_API_KEY
vercel env add GEMINI_API_KEY

# 2. 프로덕션 배포
vercel --prod
```

## 배포 후 확인사항

1. **환경 변수 확인**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - 모든 환경 변수가 올바르게 설정되었는지 확인

2. **빌드 로그 확인**
   - 배포 중 빌드 로그를 확인하여 오류가 없는지 확인

3. **애플리케이션 테스트**
   - 배포된 URL에서 애플리케이션이 정상 작동하는지 확인
   - 회사 검색 기능 테스트
   - 재무 정보 조회 기능 테스트
   - AI 분석 기능 테스트

## 문제 해결

### 빌드 오류 발생 시
- `package.json`의 의존성 확인
- Node.js 버전 확인 (Vercel은 자동으로 감지)
- 빌드 로그에서 구체적인 오류 메시지 확인

### 환경 변수 오류 시
- 환경 변수가 모든 환경(Production, Preview, Development)에 설정되었는지 확인
- 변수 이름이 정확한지 확인 (대소문자 구분)

### API 호출 오류 시
- Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- 서버 로그에서 API 호출 오류 확인

## 배포 URL

배포 완료 후 Vercel에서 제공하는 URL:
- 프로덕션: `https://financial-statement-analysis.vercel.app` (또는 커스텀 도메인)
- 프리뷰: 각 커밋마다 고유한 프리뷰 URL 생성

