import SearchBox from '@/components/SearchBox';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            재무재표 분석 시스템
          </h1>
          <p className="text-lg text-gray-600">
            오픈다트 API를 활용한 재무재표 분석 및 시각화
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            회사 검색
          </h2>
          <SearchBox />
          <p className="text-sm text-gray-500 text-center mt-4">
            회사명, 종목코드, 또는 고유번호로 검색하세요
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">회사 검색</h3>
            <p className="text-gray-600">
              한국 상장기업 정보를 빠르게 검색하고 조회할 수 있습니다.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">재무 정보 시각화</h3>
            <p className="text-gray-600">
              재무상태표와 손익계산서를 직관적인 차트로 확인하세요.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI 분석</h3>
            <p className="text-gray-600">
              Gemini AI가 재무 정보를 쉽게 이해할 수 있게 분석해드립니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

