const pool = require('../database/database');
const bcrypt = require('bcrypt');

exports.delectBoard = async (req, res) => {
  const { board_id, board_pass } = req.body;

  try {
    await pool.query('BEGIN');
    const result = await pool.query('SELECT * FROM board WHERE board_id = $1', [
      board_id,
    ]);
    console.log(result);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: '해당 게시글이 존재하지 않습니다.' });
    }
    const board = result.rows[0];
    const isMatch = await bcrypt.compare(board_pass, board.board_pass);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }
    await pool.query(
      'UPDATE board SET board_state = false, delectdate = CURRENT_TIMESTAMP WHERE board_id = $1',
      [board_id]
    );
    await pool.query('COMMIT');
    return res.status(200).json({ message: '게시글 삭제에 성공 했습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '게시글 삭제에 실패 했습니다.' });
  }
};
