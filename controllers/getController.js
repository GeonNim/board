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

exports.getComments = async (req, res) => {
  const { board_id } = req.params;

  try {
    // 특정 게시글의 댓글과 대댓글 조회
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

    const result = await pool.query(query, [board_id]);

    return res.status(200).json({
      message: '댓글 조회 성공',
      comments: result.rows,
    });
  } catch (error) {
    console.error('댓글 조회 중 오류:', error);
    return res.status(500).json({ message: '댓글 조회 실패' });
  }
};
