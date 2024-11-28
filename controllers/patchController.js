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
