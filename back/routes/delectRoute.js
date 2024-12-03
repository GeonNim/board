const router = require('express').Router();

const {
  delectBoard,
  deleteComment,
} = require('../controllers/delectController');

router.delete('/delectBoard', delectBoard);
router.delete('/deleteComment', deleteComment);

module.exports = router;
