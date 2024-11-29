const pool = require('../database/database');
const bcrypt = require('bcrypt');

// exports.patchBoard = async (req, res) => {
//   const { board_id } = req.params;
//   const { board_pass, title, content } = req.body;
//   // console.log(board_id, board_pass, title, content);
//   try {
//    await pool.query('BEGIN');
//     const result = await pool.query('SELECT * FROM board WHERE board_id = $1', [
//       board_id,
//     ]);

//     if (result.rows.length === 0) {
//       return res
//         .status(401)
//         .json({ error: '해당 게시글이 존재하지 않습니다.' });
//     }
//     const board = result.rows[0];
//     const isMatch = await bcrypt.compare(board_pass, board.board_pass);
//     if (!isMatch) {
//       return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
//     }
//     await pool.query(
//       'UPDATE board SET title = $1, content = $2, update = CURRENT_TIMESTAMP WHERE board_id = $3',
//       [title, content, board_id]
//     );
//     await pool.query('COMMIT');
//     return res.status(200).json({ message: '게시글 수정에 성공 했습니다.' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: '게시글 수정에 실패 했습니다.' });
//   }
// };

exports.patchBoard = async (req, res) => {
  const { board_id, board_pass, title, content } = req.body;

  try {
    // 트랜잭션 시작
    await pool.query('BEGIN');

    // 게시글 존재 여부 확인
    const result = await pool.query(
      'SELECT board_pass, title, content FROM board WHERE board_id = $1',
      [board_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: '해당 게시글이 존재하지 않습니다.' });
    }

    const board = result.rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(board_pass, board.board_pass);
    if (!isMatch) {
      return res.status(401).json({ error: '비밀번호가 틀렸습니다.' });
    }
    console.log(board_id, board.title, board.content);
    // 히스토리 추가
    const values = [board_id, board.title, board.content];
    const history = await pool.query(
      'INSERT INTO board_history (board_id, board_history_title, board_history_content) VALUES ($1, $2, $3)',
      values
    );

    if (history.rowCount === 0) {
      await pool.query('ROLLBACK'); // 롤백
      return res.status(401).json({ error: '이력 추가에 실패했습니다.' });
    }
    console.log(title, content);
    // 게시글 업데이트
    await pool.query(
      'UPDATE board SET title = $1, content = $2, update = CURRENT_TIMESTAMP WHERE board_id = $3',
      [title, content, board_id]
    );

    // 트랜잭션 커밋
    await pool.query('COMMIT');

    return res.status(200).json({ message: '게시글 수정에 성공 했습니다.' });
  } catch (error) {
    // 에러 발생 시 롤백
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ message: '게시글 수정에 실패 했습니다.' });
  }
};

exports.patchComment = async (req, res) => {
  const { comment_id, comment_pass, comment_content } = req.body;

  if (!comment_content) {
    return res.status(400).json({
      message: '수정할 내용을 입력해주세요.',
    });
  }

  try {
    // 댓글 존재 여부 및 비밀번호 확인
    const result = await pool.query(
      'SELECT commnet_pass FROM comment WHERE comment_id = $1 AND comment_state = true',
      [comment_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: '댓글이 존재하지 않거나 삭제되었습니다.' });
    }

    const comment = result.rows[0];
    const isMatch = await bcrypt.compare(comment_pass, comment.commnet_pass);

    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    // 댓글 수정
    const updateResult = await pool.query(
      `UPDATE comment
       SET commnet_content = $1, update = CURRENT_TIMESTAMP
       WHERE comment_id = $2 AND comment_state = true
       RETURNING *`,
      [comment_content, comment_id]
    );

    return res.status(200).json({
      message: '댓글이 성공적으로 수정되었습니다.',
      comment: updateResult.rows[0],
    });
  } catch (error) {
    console.error('댓글 수정 중 오류:', error);
    return res.status(500).json({ message: '댓글 수정 실패' });
  }
};
