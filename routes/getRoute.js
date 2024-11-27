const router = require('express').Router();

const { getAllBoards, getBoard } = require('../controllers/getController');

router.get('/getAllBoard', getAllBoards);
router.get('/getBoard/:board_id', getBoard);

module.exports = router;
