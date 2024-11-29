const router = require('express').Router();

const { patchBoard, patchComment } = require('../controllers/patchController');

router.patch('/patchBoard', patchBoard);
router.patch('/patchComment', patchComment);

module.exports = router;
