import { GoogleGenerativeAI } from '@google/generative-ai';

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

export async function analyzeFinancialData(
  corpName: string,
  financialData: FinancialData[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // 모델 선택: gemini-2.5-flash
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // 재무 데이터를 요약하여 프롬프트 생성
  const keyAccounts = financialData.filter((item) => {
    const keyNames = [
      '자산총계',
      '부채총계',
      '자본총계',
      '유동자산',
      '비유동자산',
      '유동부채',
      '비유동부채',
      '매출액',
      '영업이익',
      '당기순이익(손실)',
      '법인세차감전 순이익',
    ];
    return keyNames.includes(item.account_nm);
  });

  // 데이터 요약
  const summary: any = {
    재무상태표: {},
    손익계산서: {},
  };

  keyAccounts.forEach((item) => {
    const category = item.sj_div === 'BS' ? '재무상태표' : '손익계산서';
    if (!summary[category][item.account_nm]) {
      summary[category][item.account_nm] = {
        당기: item.thstrm_amount,
        전기: item.frmtrm_amount,
      };
      if (item.bfefrmtrm_amount) {
        summary[category][item.account_nm].전전기 = item.bfefrmtrm_amount;
      }
    }
  });

  const prompt = `
다음은 ${corpName}의 재무 정보입니다. 이 정보를 바탕으로 누구나 이해하기 쉽게 재무 상태를 분석해주세요.

재무 데이터:
${JSON.stringify(summary, null, 2)}

다음 사항을 포함하여 분석해주세요:
1. 전체적인 재무 상태 요약
2. 주요 재무 지표의 변화 추이 (당기 vs 전기)
3. 재무 건전성 평가
4. 경영 성과 분석
5. 투자자 관점에서의 주요 포인트

분석은 한국어로 작성하고, 전문 용어는 최대한 쉽게 설명해주세요. 
긍정적인 부분과 주의해야 할 부분을 균형있게 다뤄주세요.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API 오류:', error);
    throw new Error(`Gemini API 호출 오류: ${error.message}`);
  }
}

