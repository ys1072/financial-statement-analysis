import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialData } from '@/lib/gemini';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { corpName, financialData } = body;

    if (!corpName || !financialData || !Array.isArray(financialData)) {
      return NextResponse.json(
        { error: 'corpName과 financialData 배열이 필요합니다.' },
        { status: 400 }
      );
    }

    if (financialData.length === 0) {
      return NextResponse.json(
        { error: '분석할 재무 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeFinancialData(corpName, financialData as FinancialData[]);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('AI 분석 오류:', error);
    return NextResponse.json(
      { 
        error: error.message || 'AI 분석 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

