const router = require('express').Router();

const { delectBoard } = require('../controllers/delectController');

router.delete('/delectBoard', delectBoard);

module.exports = router;
