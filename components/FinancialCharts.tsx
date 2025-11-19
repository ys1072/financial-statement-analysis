'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FinancialData {
  account_nm: string;
  thstrm_amount: string;
  frmtrm_amount: string;
  bfefrmtrm_amount?: string;
  thstrm_dt: string;
  frmtrm_dt: string;
  bfefrmtrm_dt?: string;
  fs_div: string;
  sj_div: string;
}

interface FinancialChartsProps {
  data: FinancialData[];
}

// 금액 문자열을 숫자로 변환 (예: "174,697,424,000,000" -> 174697424000000)
function parseAmount(amount: string): number {
  if (!amount) return 0;
  return parseFloat(amount.replace(/,/g, '')) || 0;
}

// 큰 숫자를 읽기 쉽게 포맷팅 (억 단위)
function formatAmount(value: number): string {
  if (value >= 1000000000000) {
    return `${(value / 1000000000000).toFixed(1)}조`;
  } else if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  } else if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}만`;
  }
  return value.toLocaleString();
}

export default function FinancialCharts({ data }: FinancialChartsProps) {
  // 재무상태표 데이터 추출
  const balanceSheetData = useMemo(() => {
    const bsData = data.filter((item) => item.sj_div === 'BS');
    const accounts = ['자산총계', '부채총계', '자본총계'];
    
    return accounts.map((account) => {
      const item = bsData.find((d) => d.account_nm === account);
      if (!item) return null;

      const result: any = {
        account: account,
        당기: parseAmount(item.thstrm_amount),
        전기: parseAmount(item.frmtrm_amount),
      };

      if (item.bfefrmtrm_amount) {
        result.전전기 = parseAmount(item.bfefrmtrm_amount);
      }

      return result;
    }).filter(Boolean);
  }, [data]);

  // 손익계산서 데이터 추출
  const incomeStatementData = useMemo(() => {
    const isData = data.filter((item) => item.sj_div === 'IS');
    const accounts = ['매출액', '영업이익', '당기순이익(손실)'];
    
    return accounts.map((account) => {
      const item = isData.find((d) => d.account_nm === account);
      if (!item) return null;

      const result: any = {
        account: account,
        당기: parseAmount(item.thstrm_amount),
        전기: parseAmount(item.frmtrm_amount),
      };

      if (item.bfefrmtrm_amount) {
        result.전전기 = parseAmount(item.bfefrmtrm_amount);
      }

      return result;
    }).filter(Boolean);
  }, [data]);

  // 차트용 데이터 포맷팅
  const chartData = useMemo(() => {
    const periods: any[] = [];
    
    // 당기 데이터
    const currentPeriod: any = { period: '당기' };
    balanceSheetData.forEach((item: any) => {
      if (item) currentPeriod[item.account] = item.당기;
    });
    incomeStatementData.forEach((item: any) => {
      if (item) currentPeriod[item.account] = item.당기;
    });
    periods.push(currentPeriod);

    // 전기 데이터
    const prevPeriod: any = { period: '전기' };
    balanceSheetData.forEach((item: any) => {
      if (item) prevPeriod[item.account] = item.전기;
    });
    incomeStatementData.forEach((item: any) => {
      if (item) prevPeriod[item.account] = item.전기;
    });
    periods.push(prevPeriod);

    // 전전기 데이터 (있는 경우)
    const hasPrevPrev = balanceSheetData.some((item: any) => item?.전전기 !== undefined) ||
                        incomeStatementData.some((item: any) => item?.전전기 !== undefined);
    if (hasPrevPrev) {
      const prevPrevPeriod: any = { period: '전전기' };
      balanceSheetData.forEach((item: any) => {
        if (item && item.전전기 !== undefined) prevPrevPeriod[item.account] = item.전전기;
      });
      incomeStatementData.forEach((item: any) => {
        if (item && item.전전기 !== undefined) prevPrevPeriod[item.account] = item.전전기;
      });
      periods.push(prevPrevPeriod);
    }

    return periods;
  }, [balanceSheetData, incomeStatementData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.period}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* 재무상태표 차트 */}
      {balanceSheetData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">재무상태표 추이</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {balanceSheetData.map((item: any, index) => (
                <Line
                  key={item.account}
                  type="monotone"
                  dataKey={item.account}
                  stroke={['#8884d8', '#82ca9d', '#ffc658'][index % 3]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 손익계산서 차트 */}
      {incomeStatementData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">손익계산서 추이</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {incomeStatementData.map((item: any, index) => (
                <Line
                  key={item.account}
                  type="monotone"
                  dataKey={item.account}
                  stroke={['#ff7300', '#00ff00', '#0088fe'][index % 3]}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 주요 지표 비교 바 차트 */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">주요 지표 비교</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis 
                tickFormatter={(value) => formatAmount(value)}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {balanceSheetData.map((item: any, index) => (
                <Bar
                  key={item.account}
                  dataKey={item.account}
                  fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]}
                />
              ))}
              {incomeStatementData.map((item: any, index) => (
                <Bar
                  key={item.account}
                  dataKey={item.account}
                  fill={['#ff7300', '#00ff00', '#0088fe'][index % 3]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

