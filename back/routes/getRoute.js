const router = require('express').Router();

const {
  getAllBoards,
  getBoard,
  getComments,
} = require('../controllers/getController');

router.get('/getAllBoard', getAllBoards);
router.get('/getBoard/:board_id', getBoard);
router.get('/getComments/:board_id', getComments);

module.exports = router;
