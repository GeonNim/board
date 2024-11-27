const pool = require('../database/database');
const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.postBoard = async (req, res) => {
  const { writer, board_pass, title, content } = req.body;
  if (!writer || !board_pass || !title || !content) {
    return res.status(400).json({
      message: '모든 내용을 작성해주세요.',
    });
  }
  // console.log(req.body);
  try {
    const hash = await bcrypt.hash(board_pass, saltRounds);
    const values = [writer, hash, title, content];

    await pool.query(
      'INSERT INTO board (writer, board_pass, title, content) VALUES  ($1, $2, $3, $4)',
      values
    );
    return res
      .status(201)
      .json({ message: '성공적으로 게시글이 등록 되었습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '게시글 등록이 실패 했습니다.' });
  }
};
