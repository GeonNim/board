const router = require('express').Router();

const { postBoard, postComment } = require('../controllers/postController');

router.post('/postBoard', postBoard);
router.post('/postComment', postComment);

module.exports = router;
