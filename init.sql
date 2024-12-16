DO $$
BEGIN
    -- 데이터베이스 생성
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'board') THEN
        EXECUTE format('CREATE DATABASE %I', 'board');
    END IF;

    -- 사용자 생성
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'boardmaker') THEN
        EXECUTE format(
            'CREATE USER %I WITH PASSWORD ''%s''',
            'boardmaker',
            'qwer1324'
        );
    END IF;

    -- 권한 부여
    EXECUTE format(
        'GRANT ALL PRIVILEGES ON DATABASE %I TO %I',
        'board',
        'boardmaker'
    );
END $$;

-- 데이터베이스에 연결
\c board

-- board 테이블 생성
CREATE TABLE IF NOT EXISTS board (
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

-- comment 테이블 생성
CREATE TABLE IF NOT EXISTS comment (
    comment_id SERIAL PRIMARY KEY,             
    board_id INT NOT NULL,                     
    parent_comment_id INT NULL,                
    commnet_writer VARCHAR(100) NOT NULL,             
    commnet_pass VARCHAR(100) NOT NULL,
    commnet_content TEXT NOT NULL,            
    regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    update TIMESTAMP NULL,             
    delectdate TIMESTAMP NULL,              
    comment_state BOOLEAN NOT NULL DEFAULT true, 
    FOREIGN KEY (board_id) REFERENCES board(board_id), 
    FOREIGN KEY (parent_comment_id) REFERENCES comment(comment_id) 
);

-- board_history 테이블 생성
CREATE TABLE IF NOT EXISTS board_history (
    board_history_id SERIAL PRIMARY KEY,
    board_id INT REFERENCES board (board_id),
    board_history_title VARCHAR(100) NOT NULL,
    board_history_content VARCHAR(1000) NOT NULL,
    board_history_regdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 권한 부여: 테이블에 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO boardmaker;

-- 권한 부여: SEQUENCE에 적합한 권한만 부여
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO boardmaker;
