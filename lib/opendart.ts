interface FinancialData {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  stock_code: string;
  fs_div: string; // OFS: 재무제표, CFS: 연결재무제표
  fs_nm: string;
  sj_div: string; // BS: 재무상태표, IS: 손익계산서
  sj_nm: string;
  account_nm: string; // 계정명
  thstrm_nm: string;
  thstrm_dt: string;
  thstrm_amount: string;
  thstrm_add_amount?: string;
  frmtrm_nm: string;
  frmtrm_dt: string;
  frmtrm_amount: string;
  frmtrm_add_amount?: string;
  bfefrmtrm_nm?: string;
  bfefrmtrm_dt?: string;
  bfefrmtrm_amount?: string;
  ord: string;
  currency: string;
}

interface OpenDartResponse {
  status: string;
  message: string;
  list?: FinancialData[];
}

export async function getFinancialData(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string = '11011' // 사업보고서 기본값
): Promise<FinancialData[]> {
  const apiKey = process.env.OPENDART_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENDART_API_KEY가 설정되지 않았습니다.');
  }

  const url = `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${apiKey}&corp_code=${corpCode}&bsns_year=${bsnsYear}&reprt_code=${reprtCode}`;

  try {
    console.log('오픈다트 API 호출:', { corpCode, bsnsYear, reprtCode, apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : '없음' });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // 캐시 방지
    });

    const responseText = await response.text();
    console.log('오픈다트 API 원본 응답 (처음 1000자):', responseText.substring(0, 1000));

    if (!response.ok) {
      console.error('오픈다트 API HTTP 오류:', response.status, responseText.substring(0, 500));
      throw new Error(`오픈다트 API HTTP 오류: ${response.status} ${response.statusText}`);
    }

    // 빈 응답 체크
    if (!responseText || responseText.trim().length === 0) {
      console.error('오픈다트 API 빈 응답');
      throw new Error('오픈다트 API에서 빈 응답을 받았습니다.');
    }

    let data: OpenDartResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError: any) {
      console.error('JSON 파싱 오류:', parseError?.message, '응답 텍스트 (처음 500자):', responseText.substring(0, 500));
      throw new Error(`오픈다트 API 응답 파싱 오류: ${parseError?.message || '알 수 없는 오류'}`);
    }

    console.log('오픈다트 API 파싱된 응답:', { 
      status: data.status, 
      message: data.message, 
      listCount: data.list?.length || 0,
      hasList: !!data.list 
    });

    // status 필드가 없는 경우 처리
    if (data.status === undefined || data.status === null) {
      console.error('오픈다트 API 응답 형식 오류 - status 없음:', JSON.stringify(data).substring(0, 500));
      throw new Error('오픈다트 API 응답 형식이 올바르지 않습니다. (status 필드 없음)');
    }

    if (data.status !== '000') {
      console.error('오픈다트 API 오류 응답:', { status: data.status, message: data.message });
      const errorMsg = data.message || '알 수 없는 오류';
      // 상태 코드별 사용자 친화적 메시지
      if (data.status === '013') {
        throw new Error('해당 사업연도와 보고서에 대한 재무 정보가 없습니다.');
      } else if (data.status === '010') {
        throw new Error('잘못된 회사 고유번호입니다.');
      } else if (data.status === '800') {
        throw new Error('일일 API 호출 한도를 초과했습니다.');
      }
      throw new Error(`오픈다트 API 오류: ${errorMsg} (상태코드: ${data.status})`);
    }

    if (!data.list || data.list.length === 0) {
      console.warn('오픈다트 API 응답: 데이터가 없습니다.', { corpCode, bsnsYear, reprtCode });
      return [];
    }

    // 데이터 유효성 검사
    if (!Array.isArray(data.list)) {
      console.error('오픈다트 API 응답: list가 배열이 아닙니다.', typeof data.list);
      throw new Error('오픈다트 API 응답 형식 오류: list가 배열이 아닙니다.');
    }

    return data.list;
  } catch (error: any) {
    console.error('오픈다트 API 호출 오류 상세:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      corpCode,
      bsnsYear,
      reprtCode,
      url: url.replace(apiKey, '***'),
    });
    throw error;
  }
}

// 재무 데이터를 구조화된 형태로 변환
export function organizeFinancialData(data: FinancialData[]) {
  const organized: {
    balanceSheet: {
      individual: FinancialData[];
      consolidated: FinancialData[];
    };
    incomeStatement: {
      individual: FinancialData[];
      consolidated: FinancialData[];
    };
  } = {
    balanceSheet: {
      individual: [],
      consolidated: [],
    },
    incomeStatement: {
      individual: [],
      consolidated: [],
    },
  };

  data.forEach((item) => {
    if (item.sj_div === 'BS') {
      if (item.fs_div === 'OFS') {
        organized.balanceSheet.individual.push(item);
      } else if (item.fs_div === 'CFS') {
        organized.balanceSheet.consolidated.push(item);
      }
    } else if (item.sj_div === 'IS') {
      if (item.fs_div === 'OFS') {
        organized.incomeStatement.individual.push(item);
      } else if (item.fs_div === 'CFS') {
        organized.incomeStatement.consolidated.push(item);
      }
    }
  });

  return organized;
}

// 주요 계정 추출
export function getKeyAccounts(data: FinancialData[]) {
  const keyAccounts = [
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

  return data.filter((item) => keyAccounts.includes(item.account_nm));
}

