-- Oracle 23c GoldenGate ソースDB用 ユーザーおよびPDBセットアップスクリプト
-- このスクリプトは、CDB$ROOTコンテナにSYSDBAとして接続された状態で実行されます。

-- エラーが発生した場合は、ただちにスクリプトを終了します。
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- 1. GoldenGateレプリケーションの有効化
-- GoldenGateがデータベースから変更をキャプチャするために必須の設定です。
-- SCOPE=BOTHは、現在のインスタンスとSPFILEの両方に設定を適用します。
ALTER SYSTEM SET ENABLE_GOLDENGATE_REPLICATION=TRUE SCOPE=BOTH;

-- 2. ARCHIVELOGモードの設定
-- GoldenGateが変更をキャプチャするためには、データベースがARCHIVELOGモードである必要があります。
-- ARCHIVELOGモードでは、REDOログファイルがアーカイブされ、過去の変更履歴が保持されます。
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE OPEN;
-- Dockerコンテナの起動スクリプトがARCHIVELOGモードへの切り替えを自動で行うため、ここではコメントアウトします。
-- ただし、補助ロギングはGoldenGateが変更を正確にキャプチャするために重要なので、明示的に有効化します。
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;

-- 3. GoldenGate用の共通ユーザー 'c##ggadmin' を作成
-- マルチテナント環境では、共通ユーザー名の接頭辞として C## が必須です。
-- CONTAINER=ALLは、CDB$ROOTと全てのPDBでこのユーザーが利用可能になることを意味します。
CREATE USER c##oggsrc IDENTIFIED BY password CONTAINER=ALL;

-- 4. GoldenGateユーザー 'c##ggadmin' にExtractに必要な権限を付与
-- CONNECT, RESOURCE, UNLIMITED TABLESPACE: データベースへの接続、オブジェクト作成、表領域使用の基本権限。
-- CREATE VIEW: OGG内部でビューを作成する際に必要となる場合があります。
-- SELECT ANY DICTIONARY: データディクショナリ（データベースのメタデータ）を参照するために必要です。
--                       Extractプロセスがテーブル構造や補助ロギング情報を取得する際に使用します。
-- ALTER SYSTEM: OGG内部でシステムパラメータを変更する際に必要となる場合があります。
-- OGG_CAPTURE: Oracle 23cで推奨される、Extractプロセスに必要な権限をまとめたロールです。
-- EXECUTE ON SYS.DBMS_CAPTURE_ADM: キャプチャプロセスを管理するためのパッケージ実行権限。
-- EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM: XStream（OGGの内部技術）管理パッケージの実行権限。
-- Logminer関連の権限 (V_$, DBMS_LOGMNR): Integrated ExtractがREDOログを読み取るためにLogminerを使用するため、これらの権限が必要です。
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO c##oggsrc CONTAINER=ALL;
GRANT CREATE VIEW TO c##oggsrc CONTAINER=ALL;
GRANT SELECT ANY DICTIONARY TO c##oggsrc CONTAINER=ALL;
GRANT ALTER SYSTEM TO c##oggsrc CONTAINER=ALL;
GRANT OGG_CAPTURE TO c##oggsrc CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_CAPTURE_ADM TO c##oggsrc CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM TO c##oggsrc CONTAINER=ALL;
GRANT SELECT ON V_$DATABASE TO c##oggsrc CONTAINER=ALL;
GRANT SELECT ON V_$ARCHIVED_LOG TO c##oggsrc CONTAINER=ALL;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO c##oggsrc CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR TO c##oggsrc CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR_D TO c##oggsrc CONTAINER=ALL;

-- =================================================================
-- PDB (プラガブル・データベース) の設定
-- =================================================================

-- 5. セッションをプラガブル・データベース(FREEPDB1)に切り替え
-- アプリケーションユーザーはPDB内に作成するため、PDBに接続を切り替えます。
ALTER SESSION SET CONTAINER = FREEPDB1;

-- 6. アプリケーション用のローカル・ユーザー 'appuser' をPDB内に作成
-- アプリケーションが使用するスキーマのユーザーです。
CREATE USER appuser IDENTIFIED BY password;

-- 7. アプリケーション・ユーザーに権限を付与
-- CONNECT, RESOURCE: データベースへの接続と、テーブルなどのオブジェクトを作成するための基本権限。
-- DEFAULT TABLESPACE USERS: デフォルトの表領域をUSERSに設定します。
-- QUOTA UNLIMITED ON USERS: USERS表領域に無制限の領域を使用する権限を付与します。
GRANT CONNECT, RESOURCE TO appuser;
ALTER USER appuser DEFAULT TABLESPACE USERS;
ALTER USER appuser QUOTA UNLIMITED ON USERS;

COMMIT;
