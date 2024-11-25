const router = require('express').Router();

const { getAllBoard } = require('../controllers/getController');

router.get('/getAllBoard', getAllBoard);

module.exports = router;
