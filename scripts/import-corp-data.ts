import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import { saveCorps } from '../lib/db';

interface CorpData {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

async function importCorpData() {
  const xmlPath = path.join(process.cwd(), '..', 'Downloads', 'corp.xml');
  
  if (!fs.existsSync(xmlPath)) {
    console.error(`파일을 찾을 수 없습니다: ${xmlPath}`);
    console.error('corp.xml 파일의 경로를 확인해주세요.');
    process.exit(1);
  }

  console.log('XML 파일 읽는 중...');
  const xmlData = fs.readFileSync(xmlPath, 'utf-8');

  console.log('XML 파싱 중...');
  parseString(xmlData, (err, result) => {
    if (err) {
      console.error('XML 파싱 오류:', err);
      process.exit(1);
    }

    if (!result.result || !result.result.list) {
      console.error('XML 구조가 올바르지 않습니다.');
      process.exit(1);
    }

    const list = Array.isArray(result.result.list) 
      ? result.result.list 
      : [result.result.list];

    console.log(`총 ${list.length}개의 회사 데이터 발견`);

    const corps: CorpData[] = list.map((item: any) => ({
      corp_code: item.corp_code?.[0] || '',
      corp_name: item.corp_name?.[0] || '',
      corp_eng_name: item.corp_eng_name?.[0] || '',
      stock_code: item.stock_code?.[0] || '',
      modify_date: item.modify_date?.[0] || '',
    })).filter((corp: CorpData) => corp.corp_code && corp.corp_name);

    console.log(`유효한 데이터: ${corps.length}개`);

    console.log('데이터베이스에 저장 중...');
    saveCorps(corps);

    console.log('✅ 데이터 임포트 완료!');
    console.log(`총 ${corps.length}개의 회사 정보가 저장되었습니다.`);
  });
}

importCorpData().catch(console.error);

