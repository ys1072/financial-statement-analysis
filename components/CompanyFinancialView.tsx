'use client';

import { useState, useEffect, useCallback } from 'react';
import FinancialCharts from './FinancialCharts';
import AnalysisPanel from './AnalysisPanel';

interface CompanyFinancialViewProps {
  corpCode: string;
  corpName: string;
  defaultYear: string;
  defaultReportCode: string;
}

export default function CompanyFinancialView({
  corpCode,
  corpName,
  defaultYear,
  defaultReportCode,
}: CompanyFinancialViewProps) {
  const currentYear = new Date().getFullYear();
  const safeDefaultYear = defaultYear && parseInt(defaultYear) <= currentYear ? defaultYear : (currentYear - 1).toString();
  const [year, setYear] = useState(safeDefaultYear);
  const [reportCode, setReportCode] = useState(defaultReportCode);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportOptions = [
    { value: '11013', label: '1분기보고서' },
    { value: '11012', label: '반기보고서' },
    { value: '11014', label: '3분기보고서' },
    { value: '11011', label: '사업보고서' },
  ];

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/financial?corp_code=${corpCode}&bsns_year=${year}&reprt_code=${reportCode}`
      );

      // 응답 상태 확인
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `서버 오류 (${response.status}): ${response.statusText}` };
        }
        
        const errorMsg = errorData.error || `서버 오류: ${response.status} ${response.statusText}`;
        const suggestion = errorData.suggestion || '';
        setError(suggestion ? `${errorMsg}\n${suggestion}` : errorMsg);
        setFinancialData([]);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFinancialData(data.data?.keyAccounts || []);
        setError(null);
      } else {
        const errorMsg = data.error || '재무 정보를 불러올 수 없습니다.';
        const suggestion = data.suggestion || '';
        setError(suggestion ? `${errorMsg}\n${suggestion}` : errorMsg);
        setFinancialData([]);
      }
    } catch (err: any) {
      console.error('재무 정보 조회 오류:', err);
      setError(err.message || '재무 정보 조회 중 오류가 발생했습니다. 서버 콘솔을 확인해주세요.');
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  }, [corpCode, year, reportCode]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  // 연도 목록 생성
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* 조회 옵션 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사업연도
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보고서
            </label>
            <select
              value={reportCode}
              onChange={(e) => setReportCode(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {reportOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchFinancialData}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 font-semibold mb-2">오류 발생</div>
          <div className="text-red-600 whitespace-pre-line">{error}</div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">재무 정보를 불러오는 중...</p>
        </div>
      )}

      {/* 재무 차트 */}
      {!loading && financialData.length > 0 && (
        <>
          <FinancialCharts data={financialData} />
          
          {/* AI 분석 */}
          <AnalysisPanel corpName={corpName} financialData={financialData} />
        </>
      )}

      {/* 데이터 없음 */}
      {!loading && !error && financialData.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center text-gray-500">
          선택한 연도와 보고서에 대한 재무 정보가 없습니다.
        </div>
      )}
    </div>
  );
}

