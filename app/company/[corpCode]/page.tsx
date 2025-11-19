import { notFound } from 'next/navigation';
import { getCorpByCode } from '@/lib/db';
import FinancialCharts from '@/components/FinancialCharts';
import AnalysisPanel from '@/components/AnalysisPanel';
import CompanyFinancialView from '@/components/CompanyFinancialView';

interface PageProps {
  params: {
    corpCode: string;
  };
  searchParams: {
    year?: string;
    report?: string;
  };
}

export default async function CompanyPage({ params, searchParams }: PageProps) {
  const corp = getCorpByCode(params.corpCode);

  if (!corp) {
    notFound();
  }

  const currentYear = new Date().getFullYear();
  // 기본값은 작년으로 설정 (2025년 데이터는 아직 없을 수 있음)
  const defaultYear = (currentYear - 1).toString();
  const year = searchParams.year || defaultYear;
  const reportCode = searchParams.report || '11011'; // 사업보고서 기본값

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{corp.corp_name}</h1>
          {corp.corp_eng_name && (
            <p className="text-lg text-gray-600 mb-4">{corp.corp_eng_name}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>고유번호: {corp.corp_code}</span>
            {corp.stock_code && <span>종목코드: {corp.stock_code}</span>}
          </div>
        </div>

        {/* 재무 정보 조회 컴포넌트 */}
        <CompanyFinancialView
          corpCode={params.corpCode}
          corpName={corp.corp_name}
          defaultYear={year}
          defaultReportCode={reportCode}
        />
      </div>
    </div>
  );
}

