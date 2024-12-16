const axios = require('axios');
const { queryPostgres } = require('../database/database');
const bcrypt = require('bcryptjs');

// 게시글 등록
exports.postBoard = async (req, res) => {
  const { writer, board_pass, title, content } = req.body;
  if (!writer || !board_pass || !title || !content) {
    return res.status(400).json({ message: '모든 내용을 작성해주세요.' });
  }

  try {
    const hash = await bcrypt.hash(board_pass, 10);
    const values = [writer, hash, title, content];
    await queryPostgres(
      'INSERT INTO board (writer, board_pass, title, content) VALUES ($1, $2, $3, $4)',
      values
    );
    return res
      .status(201)
      .json({ message: '게시글이 성공적으로 등록되었습니다.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '게시글 등록 실패' });
  }
};

// 댓글 등록
exports.postComment = async (req, res) => {
  const {
    board_id,
    parent_comment_id,
    comment_writer,
    comment_pass,
    comment_content,
  } = req.body;

  if (!comment_writer || !comment_pass || !comment_content) {
    return res.status(400).json({ message: '모든 내용을 작성해주세요.' });
  }

  try {
    await queryPostgres('BEGIN');

    const boardExists = await queryPostgres(
      'SELECT board_id FROM board WHERE board_id = $1 AND board_state = true',
      [board_id]
    );
    if (boardExists.length === 0) {
      await queryPostgres('ROLLBACK');
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    if (parent_comment_id) {
      const parentExists = await queryPostgres(
        'SELECT comment_id FROM comment WHERE comment_id = $1 AND comment_state = true',
        [parent_comment_id]
      );
      if (parentExists.length === 0) {
        await queryPostgres('ROLLBACK');
        return res
          .status(404)
          .json({ message: '부모 댓글이 존재하지 않습니다.' });
      }
    }

    const hash = await bcrypt.hash(comment_pass, 10);
    const values = [
      board_id,
      parent_comment_id || null,
      comment_writer,
      hash,
      comment_content,
    ];

    await queryPostgres(
      `INSERT INTO comment (board_id, parent_comment_id, commnet_writer, commnet_pass, commnet_content)
       VALUES ($1, $2, $3, $4, $5)`,
      values
    );

    await queryPostgres('COMMIT');
    return res
      .status(201)
      .json({ message: '댓글이 성공적으로 등록되었습니다.' });
  } catch (error) {
    await queryPostgres('ROLLBACK');
    console.error('댓글 등록 중 오류:', error);
    return res.status(500).json({ message: '댓글 등록 실패' });
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
