// 오픈다트 API 테스트 스크립트
import { getFinancialData } from '../lib/opendart';

async function testAPI() {
  const corpCode = '00258689';
  const bsnsYear = '2024';
  const reprtCode = '11011';

  console.log('오픈다트 API 테스트 시작...');
  console.log('회사 코드:', corpCode);
  console.log('사업연도:', bsnsYear);
  console.log('보고서 코드:', reprtCode);
  console.log('API 키:', process.env.OPENDART_API_KEY ? `${process.env.OPENDART_API_KEY.substring(0, 10)}...` : '없음');

  try {
    const data = await getFinancialData(corpCode, bsnsYear, reprtCode);
    console.log('성공! 데이터 개수:', data.length);
    if (data.length > 0) {
      console.log('첫 번째 데이터 샘플:', JSON.stringify(data[0], null, 2));
    }
  } catch (error: any) {
    console.error('오류 발생:', error.message);
    console.error('스택:', error.stack);
  }
}

testAPI();

