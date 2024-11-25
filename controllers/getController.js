const pool = require('../database/database');

exports.getAllBoard = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM board WHERE board_state = true ORDER BY regdate DESC '
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: '게시글 전체 조회에 실패 했습니다.' + error });
  }
};
