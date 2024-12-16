const router = require('express').Router();
const {
  toggleLike,
  getLikeCount,
  getUserLikes,
} = require('../controllers/likeController');

// 좋아요 토글 (추가/취소)
router.post('/toggleLike', toggleLike);

// 특정 대상의 좋아요 개수 조회
router.get('/getLikeCount/:target_id/:target_type', getLikeCount);

// 특정 사용자의 좋아요 데이터 조회
router.get('/getUserLikes/:user_id', getUserLikes);

module.exports = router;
