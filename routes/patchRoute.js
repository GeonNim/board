const router = require('express').Router();

const { patchBoard } = require('../controllers/patchController');

router.patch('/patchBoard', patchBoard);

module.exports = router;
