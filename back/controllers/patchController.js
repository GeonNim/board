const { queryPostgres } = require('../database/database');
const bcrypt = require('bcryptjs');

exports.patchBoard = async (req, res) => {
  const { board_id, board_pass, title, content } = req.body;

  try {
    await queryPostgres('BEGIN');

    const result = await queryPostgres(
      'SELECT board_pass, title, content FROM board WHERE board_id = $1',
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

    const values = [board_id, board.title, board.content];
    const history = await queryPostgres(
      'INSERT INTO board_history (board_id, board_history_title, board_history_content) VALUES ($1, $2, $3)',
      values
    );

    if (history.rowCount === 0) {
      await queryPostgres('ROLLBACK');
      return res.status(401).json({ error: '이력 추가에 실패했습니다.' });
    }

    await queryPostgres(
      'UPDATE board SET title = $1, content = $2, update = CURRENT_TIMESTAMP WHERE board_id = $3',
      [title, content, board_id]
    );

    await queryPostgres('COMMIT');
    return res.status(200).json({ message: '게시글 수정에 성공했습니다.' });
  } catch (error) {
    await queryPostgres('ROLLBACK');
    console.error('게시글 수정 중 오류:', error);
    return res.status(500).json({ message: '게시글 수정 실패' });
  }
};

exports.patchComment = async (req, res) => {
  const { comment_id, comment_pass, comment_content } = req.body;

  if (!comment_content) {
    return res.status(400).json({ message: '수정할 내용을 입력해주세요.' });
  }

  try {
    const result = await queryPostgres(
      'SELECT commnet_pass FROM comment WHERE comment_id = $1 AND comment_state = true',
      [comment_id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ message: '댓글이 존재하지 않거나 삭제되었습니다.' });
    }

    const comment = result[0];
    const isMatch = await bcrypt.compare(comment_pass, comment.commnet_pass);

    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const updateResult = await queryPostgres(
      `UPDATE comment
       SET commnet_content = $1, update = CURRENT_TIMESTAMP
       WHERE comment_id = $2 AND comment_state = true
       RETURNING *`,
      [comment_content, comment_id]
    );

    return res.status(200).json({
      message: '댓글 수정에 성공했습니다.',
      comment: updateResult[0],
    });
  } catch (error) {
    console.error('댓글 수정 중 오류:', error);
    return res.status(500).json({ message: '댓글 수정 실패' });
  }
};
