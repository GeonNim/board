const { queryPostgres } = require('../database/database');

// 게시글 전체 조회
exports.getAllBoards = async (req, res) => {
  try {
    const result = await queryPostgres(
      'SELECT * FROM board WHERE board_state = true ORDER BY regdate DESC'
    );
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: '게시글 전체 조회에 실패 했습니다.' });
  }
};

// 특정 게시글 조회
exports.getBoard = async (req, res) => {
  const { board_id } = req.params;
  try {
    const result = await queryPostgres(
      'SELECT * FROM board WHERE board_state = true AND board_id = $1',
      [board_id]
    );
    if (result.length === 0) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    return res.status(500).json({ message: '게시글 조회에 실패 했습니다.' });
  }
};

// 댓글 조회
exports.getComments = async (req, res) => {
  const { board_id } = req.params;

  try {
    const query = `
      WITH RECURSIVE comment_hierarchy AS (
          SELECT 
              comment_id,
              parent_comment_id,
              board_id,
              commnet_writer,
              commnet_content,
              regdate,
              comment_state,
              1 AS depth
          FROM comment
          WHERE board_id = $1
            AND comment_state = true
            AND parent_comment_id IS NULL

          UNION ALL

          SELECT 
              c.comment_id,
              c.parent_comment_id,
              c.board_id,
              c.commnet_writer,
              c.commnet_content,
              c.regdate,
              c.comment_state,
              ch.depth + 1
          FROM comment c
          INNER JOIN comment_hierarchy ch 
              ON c.parent_comment_id = ch.comment_id
          WHERE c.comment_state = true
      )
      SELECT 
          comment_id,
          parent_comment_id,
          board_id,
          commnet_writer,
          commnet_content,
          regdate,
          depth
      FROM comment_hierarchy
      ORDER BY depth, regdate;
    `;
    const comments = await queryPostgres(query, [board_id]);
    return res.status(200).json({
      message: '댓글 조회 성공',
      comments,
    });
  } catch (error) {
    console.error('댓글 조회 중 오류:', error);
    return res.status(500).json({ message: '댓글 조회 실패' });
  }
};
