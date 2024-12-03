const pool = require('../database/database');
const bcrypt = require('bcryptjs');

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

exports.deleteComment = async (req, res) => {
  const { comment_id, comment_pass } = req.body;

  try {
    // 트랜잭션 시작
    await pool.query('BEGIN');

    // 댓글 존재 여부 및 비밀번호 확인
    const result = await pool.query(
      'SELECT commnet_pass FROM comment WHERE comment_id = $1 AND comment_state = true',
      [comment_id]
    );

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res
        .status(404)
        .json({ message: '댓글이 존재하지 않거나 이미 삭제되었습니다.' });
    }

    const comment = result.rows[0];
    const isMatch = await bcrypt.compare(comment_pass, comment.commnet_pass);

    if (!isMatch) {
      await pool.query('ROLLBACK');
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    // 댓글 삭제 (대댓글은 유지)
    await pool.query(
      `UPDATE comment
       SET comment_state = false, delectdate = CURRENT_TIMESTAMP
       WHERE comment_id = $1`,
      [comment_id]
    );

    // 트랜잭션 커밋
    await pool.query('COMMIT');

    return res
      .status(200)
      .json({ message: '댓글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    // 에러 발생 시 롤백
    await pool.query('ROLLBACK');
    console.error('댓글 삭제 중 오류:', error);
    return res.status(500).json({ message: '댓글 삭제 실패' });
  }
};
