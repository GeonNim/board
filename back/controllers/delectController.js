const { queryPostgres } = require('../database/database');
const bcrypt = require('bcryptjs');

exports.delectBoard = async (req, res) => {
  const { board_id, board_pass } = req.body;

  try {
    await queryPostgres('BEGIN');

    const result = await queryPostgres(
      'SELECT * FROM board WHERE board_id = $1',
      [board_id]
    );

    if (result.length === 0) {
      return res
        .status(401)
        .json({ error: '해당 게시글이 존재하지 않습니다.' });
    }

    const board = result[0];
    const isMatch = await bcrypt.compare(board_pass, board.board_pass);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }

    await queryPostgres(
      'UPDATE board SET board_state = false, delectdate = CURRENT_TIMESTAMP WHERE board_id = $1',
      [board_id]
    );

    await queryPostgres('COMMIT');
    return res.status(200).json({ message: '게시글 삭제에 성공했습니다.' });
  } catch (error) {
    await queryPostgres('ROLLBACK');
    console.error(error);
    return res.status(500).json({ message: '게시글 삭제에 실패했습니다.' });
  }
};

exports.deleteComment = async (req, res) => {
  const { comment_id, comment_pass } = req.body;

  try {
    await queryPostgres('BEGIN');

    const result = await queryPostgres(
      'SELECT commnet_pass FROM comment WHERE comment_id = $1 AND comment_state = true',
      [comment_id]
    );

    if (result.length === 0) {
      await queryPostgres('ROLLBACK');
      return res
        .status(404)
        .json({ message: '댓글이 존재하지 않거나 이미 삭제되었습니다.' });
    }

    const comment = result[0];
    const isMatch = await bcrypt.compare(comment_pass, comment.commnet_pass);

    if (!isMatch) {
      await queryPostgres('ROLLBACK');
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    await queryPostgres(
      `UPDATE comment
       SET comment_state = false, delectdate = CURRENT_TIMESTAMP
       WHERE comment_id = $1`,
      [comment_id]
    );

    await queryPostgres('COMMIT');
    return res.status(200).json({ message: '댓글 삭제에 성공했습니다.' });
  } catch (error) {
    await queryPostgres('ROLLBACK');
    console.error('댓글 삭제 중 오류:', error);
    return res.status(500).json({ message: '댓글 삭제 실패' });
  }
};
