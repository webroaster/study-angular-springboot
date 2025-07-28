-- Oracle 23c GoldenGate用 ユーザーおよびPDBセットアップスクリプト
-- このスクリプトは、CDB$ROOTコンテナにSYSDBAとして接続された状態で実行されます。

-- エラーが発生した場合は、ただちにスクリプトを終了します。
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- 1. GoldenGateレプリケーションの有効化 (CDB$ROOTでの実行が必須)
ALTER SYSTEM SET ENABLE_GOLDENGATE_REPLICATION=TRUE SCOPE=BOTH;

-- 2. ARCHIVELOGモードの設定
-- GoldenGateが変更をキャプチャするためには、データベースがARCHIVELOGモードである必要があります。
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER DATABASE OPEN;

-- 3. GoldenGate用の共通ユーザーを作成
-- マルチテナント環境では、ユーザー名の接頭辞として C## が必須です。
CREATE USER c##ggadmin IDENTIFIED BY password CONTAINER=ALL;

-- 4. GoldenGateユーザーに必要な権限を付与
-- データベースが完全にオープンされた状態で、権限を付与します。
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO c##ggadmin CONTAINER=ALL;
GRANT CREATE VIEW TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ANY DICTIONARY TO c##ggadmin CONTAINER=ALL;
GRANT ALTER SYSTEM TO c##ggadmin CONTAINER=ALL;

-- Replicatが別スキーマのテーブルを操作するための強力な権限を付与
GRANT INSERT ANY TABLE, UPDATE ANY TABLE, DELETE ANY TABLE TO c##ggadmin CONTAINER=ALL;

-- Oracle 23c推奨のロールベースの権限を付与
GRANT OGG_CAPTURE TO c##ggadmin CONTAINER=ALL;
GRANT OGG_APPLY TO c##ggadmin CONTAINER=ALL;

-- GoldenGateが内部的に使用するパッケージへの実行権限
GRANT EXECUTE ON SYS.DBMS_CAPTURE_ADM TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM TO c##ggadmin CONTAINER=ALL;

-- 統合Extractに必要なLogminerへのアクセス権限
GRANT SELECT ON V_$DATABASE TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$ARCHIVED_LOG TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR_D TO c##ggadmin CONTAINER=ALL;


-- =================================================================
-- PDB (プラガブル・データベース) の設定
-- =================================================================

-- 5. セッションをプラガブル・データベース(FREEPDB1)に切り替え
ALTER SESSION SET CONTAINER = FREEPDB1;

-- 6. アプリケーション用のローカル・ユーザー 'appuser' をPDB内に作成
CREATE USER appuser IDENTIFIED BY password;

-- 7. アプリケーション・ユーザーに権限を付与
GRANT CONNECT, RESOURCE TO appuser;
ALTER USER appuser DEFAULT TABLESPACE USERS;
ALTER USER appuser QUOTA UNLIMITED ON USERS;

COMMIT;
