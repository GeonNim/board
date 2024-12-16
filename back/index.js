const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const port = 8000;
const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// 기본 경로
app.get('/', (req, res) => {
  res.send('Hello World! Test Server Running.');
});

// 라우트 파일 연결
app.use('/api/post', require('./routes/postRoute')); // 등록 관련
app.use('/api/get', require('./routes/getRoute')); // 조회 관련
app.use('/api/patch', require('./routes/patchRoute')); // 수정 관련
app.use('/api/delect', require('./routes/delectRoute')); // 삭제 관련
app.use('/api/like', require('./routes/likeRoute')); // 좋아요 관련

// 서버 실행
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
