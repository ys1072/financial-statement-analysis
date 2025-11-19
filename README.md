# 재무재표 분석 시스템

오픈다트 API를 활용한 재무재표 분석 및 시각화 웹 애플리케이션입니다.

## 주요 기능

1. **회사 검색**: 한국 상장기업 정보를 검색하여 고유번호(corp_code)를 조회할 수 있습니다.
2. **재무 정보 시각화**: 오픈다트 API에서 가져온 재무 정보를 차트로 시각화합니다.
3. **AI 분석**: Gemini API를 활용하여 재무 정보를 쉽게 이해할 수 있게 분석합니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **데이터베이스**: JSON 파일 기반 (Vercel 배포 최적화)
- **시각화**: Recharts
- **스타일링**: Tailwind CSS
- **API**: 오픈다트 API, Google Gemini API

## 설치 및 실행

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```
OPENDART_API_KEY=your_opendart_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. 회사 데이터 임포트

corp.xml 파일을 프로젝트 루트의 상위 디렉토리의 Downloads 폴더에 위치시키고 다음 명령을 실행하세요:

```bash
npm run import-corp
```

또는 `scripts/import-corp-data.ts` 파일에서 XML 파일 경로를 수정한 후 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포 (Vercel)

### 1. Vercel 프로젝트 생성

Vercel 대시보드에서 새 프로젝트를 생성하고 GitHub 저장소를 연결하세요.

### 2. 환경 변수 설정

Vercel 대시보드의 프로젝트 설정 > Environment Variables에서 다음 환경 변수를 추가하세요:

- `OPENDART_API_KEY`: 오픈다트 API 키
- `GEMINI_API_KEY`: Gemini API 키

### 3. 데이터 파일 배포

`data/corp.json` 파일을 프로젝트에 포함시키거나, 빌드 시 생성되도록 설정하세요.

## 프로젝트 구조

```
재무재표/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 검색 페이지
│   ├── api/
│   │   ├── search/route.ts     # 회사 검색 API
│   │   ├── financial/route.ts  # 재무 정보 조회 API
│   │   └── analyze/route.ts    # AI 분석 API
│   └── company/[corpCode]/page.tsx  # 회사 상세 페이지
├── components/
│   ├── SearchBox.tsx           # 회사 검색 컴포넌트
│   ├── FinancialCharts.tsx     # 재무 차트 컴포넌트
│   ├── AnalysisPanel.tsx       # AI 분석 결과 컴포넌트
│   └── CompanyFinancialView.tsx # 회사 재무 정보 뷰
├── lib/
│   ├── db.ts                   # 데이터베이스 유틸리티
│   ├── opendart.ts             # 오픈다트 API 클라이언트
│   └── gemini.ts               # Gemini API 클라이언트
├── scripts/
│   └── import-corp-data.ts     # corp.xml 데이터 임포트 스크립트
└── data/
    └── corp.json               # 회사 정보 데이터베이스
```

## API 엔드포인트

### GET /api/search
회사 검색

**쿼리 파라미터:**
- `q`: 검색어 (회사명, 종목코드, 고유번호)

**응답:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### GET /api/financial
재무 정보 조회

**쿼리 파라미터:**
- `corp_code`: 회사 고유번호 (필수)
- `bsns_year`: 사업연도 (필수)
- `reprt_code`: 보고서 코드 (선택, 기본값: 11011)

**보고서 코드:**
- `11013`: 1분기보고서
- `11012`: 반기보고서
- `11014`: 3분기보고서
- `11011`: 사업보고서

### POST /api/analyze
AI 재무 분석

**요청 본문:**
```json
{
  "corpName": "회사명",
  "financialData": [...]
}
```

## 주의사항

- API 키는 반드시 환경 변수로 관리하고 `.gitignore`에 추가하세요.
- 실제 데이터만 사용하며 데모 데이터는 사용하지 않습니다.
- 모든 API 호출에 에러 처리가 적용되어 있습니다.
- Vercel 배포 시 환경 변수 설정이 필요합니다.

## 라이선스

MIT

