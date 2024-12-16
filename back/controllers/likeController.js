const { queryPostgres } = require('../database/database');
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  target_id: { type: String, required: true },
  target_type: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const Like = mongoose.model('Like', likeSchema);

exports.toggleLike = async (req, res) => {
  const { user_id, target_id, target_type } = req.body;

  try {
    const tableMap = { post: 'board', comment: 'comment', feed: 'feeds' };
    const targetTable = tableMap[target_type];

    if (!targetTable) {
      return res
        .status(400)
        .json({ message: '유효하지 않은 target_type입니다.' });
    }

    const targetExists = await queryPostgres(
      `SELECT 1 FROM ${targetTable} WHERE id = $1`,
      [target_id]
    );

    if (targetExists.length === 0) {
      return res.status(404).json({ message: '대상이 존재하지 않습니다.' });
    }

    const existingLike = await Like.findOne({
      user_id,
      target_id,
      target_type,
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      return res.status(200).json({ message: '좋아요 취소 완료' });
    } else {
      const newLike = new Like({ user_id, target_id, target_type });
      await newLike.save();
      return res.status(201).json({ message: '좋아요 등록 완료' });
    }
  } catch (error) {
    console.error('좋아요 처리 중 오류:', error);
    return res.status(500).json({ message: '좋아요 처리 실패' });
  }
};
