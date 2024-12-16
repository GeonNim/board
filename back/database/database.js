const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: '/app/.env' });
console.log(process.env.DB_HOST); // 값 확인
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;

async function connectDB(retries = 5) {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL에 성공적으로 연결되었습니다!');
    client.release();
  } catch (err) {
    console.error(`데이터베이스 연결 실패. 재시도 남은 횟수: ${retries}`, err);
    if (retries > 0) {
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('데이터베이스 연결 재시도가 모두 실패했습니다.');
    }
  }
}
connectDB();
