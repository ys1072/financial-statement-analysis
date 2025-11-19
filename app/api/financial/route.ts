import { NextRequest, NextResponse } from 'next/server';
import { getFinancialData, organizeFinancialData, getKeyAccounts } from '@/lib/opendart';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const corpCode = searchParams.get('corp_code');
    const bsnsYear = searchParams.get('bsns_year');
    const reprtCode = searchParams.get('reprt_code') || '11011';

    console.log('재무 정보 조회 요청:', { corpCode, bsnsYear, reprtCode });

    if (!corpCode || !bsnsYear) {
      return NextResponse.json(
        { error: 'corp_code와 bsns_year는 필수 파라미터입니다.' },
        { status: 400 }
      );
    }

    // 연도 검증 (2015년 이후만 지원)
    const year = parseInt(bsnsYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 2015 || year > currentYear) {
      return NextResponse.json(
        { error: `사업연도는 2015년부터 ${currentYear}년까지 지원됩니다.` },
        { status: 400 }
      );
    }

    // 환경 변수 확인
    if (!process.env.OPENDART_API_KEY) {
      console.error('OPENDART_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: '서버 설정 오류: API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    let financialData;
    try {
      financialData = await getFinancialData(corpCode, bsnsYear, reprtCode);
    } catch (apiError: any) {
      console.error('오픈다트 API 호출 실패:', apiError);
      // API 오류를 그대로 전달하되, 사용자 친화적인 메시지로 변환
      throw apiError;
    }
    
    // 빈 배열 체크는 아래에서 처리

    try {
      // 데이터가 비어있지 않은지 확인
      if (!financialData || financialData.length === 0) {
        return NextResponse.json(
          { 
            error: '재무 정보를 찾을 수 없습니다. 해당 연도와 보고서에 대한 데이터가 없을 수 있습니다.',
            suggestion: '다른 연도나 보고서를 선택해보세요.'
          },
          { status: 404 }
        );
      }

      const organized = organizeFinancialData(financialData);
      const keyAccounts = getKeyAccounts(financialData);

      console.log('재무 정보 조회 성공:', { 
        totalCount: financialData.length, 
        keyAccountsCount: keyAccounts.length 
      });

      return NextResponse.json({
        success: true,
        data: {
          raw: financialData,
          organized,
          keyAccounts: keyAccounts || [],
        },
      });
    } catch (processError: any) {
      console.error('재무 데이터 처리 오류:', {
        error: processError.message,
        stack: processError.stack,
        name: processError.name,
      });
      throw new Error(`재무 데이터 처리 중 오류: ${processError.message}`);
    }
  } catch (error: any) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      corpCode,
      bsnsYear,
      reprtCode,
    };
    
    console.error('재무 정보 조회 오류 상세:', errorDetails);
    
    // 더 자세한 에러 메시지 제공
    let errorMessage = error.message || '재무 정보 조회 중 오류가 발생했습니다.';
    
    // 오픈다트 API 특정 오류 처리
    if (errorMessage.includes('오픈다트 API')) {
      if (errorMessage.includes('013') || errorMessage.includes('데이터가 없습니다')) {
        errorMessage = '해당 사업연도와 보고서에 대한 재무 정보가 없습니다.';
      } else if (errorMessage.includes('010')) {
        errorMessage = '잘못된 회사 고유번호입니다.';
      } else if (errorMessage.includes('800')) {
        errorMessage = '일일 API 호출 한도를 초과했습니다.';
      } else if (errorMessage.includes('파싱 오류')) {
        errorMessage = '서버에서 API 응답을 처리하는 중 오류가 발생했습니다.';
      } else if (errorMessage.includes('응답 형식')) {
        errorMessage = 'API 응답 형식이 예상과 다릅니다.';
      }
    }
    
    // 개발 환경에서만 상세 정보 포함
    const response: any = { 
      error: errorMessage,
      success: false,
    };
    
    if (process.env.NODE_ENV === 'development') {
      response.details = error.stack;
      response.debug = {
        name: error.name,
        message: error.message,
      };
    }
    
    return NextResponse.json(response, { status: 500 });
  }
}

