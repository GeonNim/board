const router = require('express').Router();

const { patchBoard } = require('../controllers/patchController');

router.patch('/patchBoard/:board_id', patchBoard);

module.exports = router;
