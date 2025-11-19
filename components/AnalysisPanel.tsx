'use client';

import { useState } from 'react';

interface AnalysisPanelProps {
  corpName: string;
  financialData: any[];
}

export default function AnalysisPanel({ corpName, financialData }: AnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          corpName,
          financialData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || '분석 중 오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '분석 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">AI 재무 분석</h3>
        <button
          onClick={handleAnalyze}
          disabled={loading || financialData.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? '분석 중...' : '분석 시작'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {analysis.split('\n').map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-center">
          위의 "분석 시작" 버튼을 클릭하여 AI 재무 분석을 시작하세요.
        </div>
      )}
    </div>
  );
}

