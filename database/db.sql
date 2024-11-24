-- 게시글 생성
CREATE TABLE board (
    board_id SERIAL PRIMARY KEY,
    writer VARCHAR(100) NOT NULL,
    board_pass VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedate TIMESTAMP NULL,
    deletedate TIMESTAMP NULL,
    board_state BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON COLUMN board.board_id IS '게시글 ID';
COMMENT ON COLUMN board.writer IS '작성자';
COMMENT ON COLUMN board.board_pass IS '게시글 비밀번호';
COMMENT ON COLUMN board.title IS '제목';
COMMENT ON COLUMN board.content IS '내용';
COMMENT ON COLUMN board.regdate IS '등록일';
COMMENT ON COLUMN board.updatedate IS '수정일';
COMMENT ON COLUMN board.deletedate IS '삭제일';
COMMENT ON COLUMN board.board_state IS '상태';


