const router = require('express').Router();

const { postBoard } = require('../controllers/postController');

router.post('/postBoard', postBoard);

module.exports = router;
