const router = require('express').Router();
const axios = require('axios');

const { postBoard, postComment } = require('../controllers/postController');

router.post('/postBoard', postBoard);
router.post('/postComment', postComment);

// Python 서버 호출 라우트
router.post('/predict', async (req, res) => {
  const { text } = req.body;

  try {
    // Docker Compose의 Python 서버에 요청
    const response = await axios.post('http://python-server:4000/predict', {
      text,
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Python API 호출 실패:', error.message);
    res.status(500).send('Python API 호출 중 오류가 발생했습니다.');
  }
});

module.exports = router;
