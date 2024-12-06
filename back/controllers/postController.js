const pool = require('../database/database');
const bcrypt = require('bcryptjs');
const axios = require('axios');

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

exports.postComment = async (req, res) => {
  const {
    board_id,
    parent_comment_id,
    comment_writer,
    comment_pass,
    comment_content,
  } = req.body;

  // 입력값 검증
  if (!comment_writer || !comment_pass || !comment_content) {
    return res.status(400).json({
      message: '모든 내용을 작성해주세요.',
    });
  }

  try {
    // 트랜잭션 시작
    await pool.query('BEGIN');

    // 게시글 존재 여부 확인
    const boardCheckResult = await pool.query(
      'SELECT board_id FROM board WHERE board_id = $1 AND board_state = true',
      [board_id]
    );

    if (boardCheckResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        message: '해당 게시글이 존재하지 않거나 비활성화 상태입니다.',
      });
    }

    // 부모 댓글 존재 여부 확인 (대댓글인 경우)
    if (parent_comment_id) {
      const parentCheckResult = await pool.query(
        'SELECT comment_id FROM comment WHERE comment_id = $1 AND comment_state = true',
        [parent_comment_id]
      );

      if (parentCheckResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          message: '부모 댓글이 존재하지 않거나 삭제되었습니다.',
        });
      }
    }

    // 비밀번호 해싱
    const hash = await bcrypt.hash(comment_pass, 10);

    // 댓글 또는 대댓글 등록
    const values = [
      board_id,
      parent_comment_id,
      comment_writer,
      hash,
      comment_content,
    ];
    const commentResult = await pool.query(
      `INSERT INTO comment (board_id, parent_comment_id, commnet_writer, commnet_pass, commnet_content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values
    );

    // 트랜잭션 커밋
    await pool.query('COMMIT');

    // 성공 응답
    return res.status(201).json({
      message: '댓글이 성공적으로 등록되었습니다.',
      comment: commentResult.rows[0],
    });
  } catch (error) {
    // 에러 발생 시 롤백
    await pool.query('ROLLBACK');
    console.error('댓글 등록 중 오류:', error);
    return res.status(500).json({ message: '댓글 등록에 실패했습니다.' });
  }
};

exports.predictText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: '텍스트를 입력해주세요.' });
  }

  try {
    // Docker Compose의 Python 서버에 요청
    const response = await axios.post('http://python-server:4000/predict', {
      text,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Python API 호출 실패:', error.message);
    res
      .status(500)
      .json({ message: 'Python API 호출 중 오류가 발생했습니다.' });
  }
};
