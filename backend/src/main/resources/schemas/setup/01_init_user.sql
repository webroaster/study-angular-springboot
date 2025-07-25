-- =================================================================
-- CDB$ROOT (コンテナ・データベース・ルート) で実行されるコマンド
-- =================================================================
-- このスクリプトは、自動的にCDB$ROOTにSYSDBAとして接続された状態で実行されます。

-- 1. GoldenGateレプリケーションを有効化 (CDB$ROOTでの実行が必須)
ALTER SYSTEM SET ENABLE_GOLDENGATE_REPLICATION=TRUE SCOPE=BOTH;

-- ★★★★★【追加】ARCHIVELOGモードを有効化 ★★★★★
-- データベースをマウント状態にしてからARCHIVELOGモードを有効にし、再度オープンします。
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;

-- ★★★★★【追加】Logmining Serverの有効化と設定 ★★★★★
-- DBA_RECYCLEBIN のパージを無効化
ALTER SYSTEM SET "_recyclebin_retention_time" = 0 SCOPE=SPFILE;
-- Logmining Serverの並列度を設定
ALTER SYSTEM SET "_log_parallelism_max" = 8 SCOPE=SPFILE;

-- Logminerの起動に必要な追加パラメータ
ALTER SYSTEM SET "_enable_logminer_parallel_capture" = TRUE SCOPE=SPFILE;

-- Logminer辞書の再構築 (Integrated ExtractがLogminerを自動起動しない場合に試す)
-- これは、Logminer辞書が破損している場合に有効
EXEC DBMS_LOGMNR_D.BUILD(options => DBMS_LOGMNR_D.STORE_IN_DB);

-- Logminer関連の追加権限付与 (念のため)
GRANT SELECT ON V_$ARCHIVED_LOG TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$DATABASE TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR_D TO c##ggadmin CONTAINER=ALL;
-- ★★★★★ ここまで追加 ★★★★★
ALTER DATABASE OPEN;
-- ★★★★★ ここまで追加 ★★★★★

-- 2. GoldenGate用の共通ユーザーを作成 (Oracle 12c以降の命名規則に従い、接頭辞 C## が必須)
CREATE USER c##ggadmin IDENTIFIED BY password CONTAINER=ALL;

-- 3. 共通ユーザーに基本的な権限を全てのコンテナで付与
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO c##ggadmin CONTAINER=ALL;
GRANT CREATE VIEW TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ANY DICTIONARY TO c##ggadmin CONTAINER=ALL;
GRANT ALTER SYSTEM TO c##ggadmin CONTAINER=ALL;

-- ★★★★★【最終修正】★★★★★
-- 4. Oracle 23c の新しいロールベースの権限モデルを使用して権限を付与
--    廃止されたプロシージャの代わりに、OGG_CAPTURE と OGG_APPLY ロールを直接GRANTします。
GRANT OGG_CAPTURE TO c##ggadmin CONTAINER=ALL;
GRANT OGG_APPLY TO c##ggadmin CONTAINER=ALL;

-- 5. 念のため、過去のエラーで確認された特定のパッケージに対する実行権限を明示的に付与
GRANT EXECUTE ON SYS.DBMS_CAPTURE_ADM TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM TO c##ggadmin CONTAINER=ALL;

-- ★★★★★【追加】Logmining Server関連の権限付与 ★★★★★
-- Logmining Serverの操作に必要な権限
GRANT SELECT ON V_$DATABASE TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$ARCHIVED_LOG TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR_D TO c##ggadmin CONTAINER=ALL;
-- ★★★★★ ここまで追加 ★★★★★


-- =================================================================
-- PDB (プラガブル・データベース) で実行されるコマンド
-- =================================================================
-- 6. セッションをプラガブル・データベース(FREEPDB1)に切り替え
ALTER SESSION SET CONTAINER = FREEPDB1;

-- 7. アプリケーション用のローカル・ユーザー 'appuser' をPDB内に作成
CREATE USER appuser IDENTIFIED BY password;

-- 8. アプリケーション・ユーザーに権限を付与
GRANT CONNECT, RESOURCE TO appuser;
ALTER USER appuser DEFAULT TABLESPACE USERS;
ALTER USER appuser QUOTA UNLIMITED ON USERS;
