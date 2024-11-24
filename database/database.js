const { Pool } = require('pg');

require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;

async function connectDB() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL에 성공적으로 연결되었습니다!');

    // 쿼리 실행 예시
    const res = await client.query('SELECT NOW()');
    console.log('현재 시간:', res.rows[0]);

    client.release(); // 연결 해제
  } catch (err) {
    console.error('데이터베이스 연결 에러:', err);
  }
}

connectDB();
