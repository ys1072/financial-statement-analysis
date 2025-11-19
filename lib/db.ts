import fs from 'fs';
import path from 'path';

interface CorpData {
  corp_code: string;
  corp_name: string;
  corp_eng_name: string;
  stock_code: string;
  modify_date: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'corp.json');

// 데이터베이스 초기화
function initDB(): CorpData[] {
  if (!fs.existsSync(DB_PATH)) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// 회사 검색 함수
export function searchCorp(query: string): CorpData[] {
  const data = initDB();
  const lowerQuery = query.toLowerCase();
  
  return data.filter(corp => 
    corp.corp_name.toLowerCase().includes(lowerQuery) ||
    corp.corp_eng_name.toLowerCase().includes(lowerQuery) ||
    corp.stock_code.includes(query) ||
    corp.corp_code.includes(query)
  ).slice(0, 50); // 최대 50개 결과만 반환
}

// corp_code로 회사 정보 조회
export function getCorpByCode(corpCode: string): CorpData | null {
  const data = initDB();
  return data.find(corp => corp.corp_code === corpCode) || null;
}

// 모든 데이터 반환 (임포트용)
export function getAllCorps(): CorpData[] {
  return initDB();
}

// 데이터 저장 (임포트용)
export function saveCorps(corps: CorpData[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(corps, null, 2));
}

