-- PDB (Pluggable Database) にセッションを切り替える
-- FREEPDB1 は Docker イメージによって自動的に作成されるデフォルトの PDB 名（v23.6.0-free）
ALTER SESSION SET CONTAINER = FREEPDB1;

-- アプリケーション用のユーザー 'appuser' を作成し、パスワードを設定
-- Oracle では、二重引用符で囲まないユーザー名は自動的に大文字に変換される (APPUSER)
CREATE USER appuser IDENTIFIED BY password;

-- 'appuser' にデータベースへの接続権限と、自身のスキーマ内にオブジェクトを作成する権限を付与
GRANT CONNECT, RESOURCE TO appuser;

-- 'appuser' のデフォルト表領域を 'USERS' に設定
-- 'USERS' 表領域は Docker イメージによって自動的に作成される（v23.6.0-free）
ALTER USER appuser DEFAULT TABLESPACE USERS;

-- 'appuser' が 'USERS' 表領域を無制限に使用できるようにクォータを設定
ALTER USER appuser QUOTA UNLIMITED ON USERS;
