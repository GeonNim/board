const router = require('express').Router();

const { postBoard, postComment,predictText } = require('../controllers/postController');

router.post('/postBoard', postBoard);
router.post('/postComment', postComment);

// Python 서버 호출 라우트
router.post('/predict', predictText);
});

module.exports = router;
