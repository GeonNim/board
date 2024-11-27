const pool = require('../database/database');

exports.getAllBoards = async (req, res) => {
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

exports.getBoard = async (req, res) => {
  const { board_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM board WHERE board_state = true and board_id = $1 ORDER BY regdate DESC',
      [board_id]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: '게시글을 불러오는데 실패 했습니다.' + error });
  }
};
