-- Oracle 23c GoldenGate ターゲットDB用 ユーザーおよびPDBセットアップスクリプト
-- このスクリプトは、CDB$ROOTコンテナにSYSDBAとして接続された状態で実行されます。

-- エラーが発生した場合は、ただちにスクリプトを終了します。
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- 1. GoldenGateレプリケーションの有効化
-- GoldenGateがデータベースに変更を適用するために必須の設定です。
-- SCOPE=BOTHは、現在のインスタンスとSPFILEの両方に設定を適用します。
ALTER SYSTEM SET ENABLE_GOLDENGATE_REPLICATION=TRUE SCOPE=BOTH;

-- 2. ARCHIVELOGモードの設定
-- GoldenGateが変更を適用する上で必須ではありませんが、チェックポイントテーブルの管理や
-- 将来的な拡張性（例えば、ターゲットDBをソースとする別のレプリケーションなど）を考慮すると、
-- ARCHIVELOGモードにしておくのがベストプラクティスです。
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER DATABASE OPEN;

-- 3. GoldenGate用の共通ユーザー 'c##oggtgt' を作成
-- マルチテナント環境では、共通ユーザー名の接頭辞として C## が必須です。
-- CONTAINER=ALLは、CDB$ROOTと全てのPDBでこのユーザーが利用可能になることを意味します。
CREATE USER c##oggtgt IDENTIFIED BY password CONTAINER=ALL;

-- 4. GoldenGateユーザー 'c##oggtgt' にReplicatに必要な権限を付与
-- CONNECT, RESOURCE, UNLIMITED TABLESPACE: データベースへの接続、オブジェクト作成、表領域使用の基本権限。
-- CREATE VIEW: OGG内部でビューを作成する際に必要となる場合があります。
-- SELECT ANY DICTIONARY: データディクショナリ（データベースのメタデータ）を参照するために必要です。
--                       Replicatプロセスがテーブル構造や補助ロギング情報を取得する際に使用します。
-- ALTER SYSTEM: OGG内部でシステムパラメータを変更する際に必要となる場合があります。
-- INSERT ANY TABLE, UPDATE ANY TABLE, DELETE ANY TABLE: Replicatがターゲットスキーマのテーブルにデータを適用するために必要です。
-- OGG_APPLY: Oracle 23cで推奨される、Replicatプロセスに必要な権限をまとめたロールです。
-- EXECUTE ON SYS.DBMS_CAPTURE_ADM, EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM: OGG内部で使用するパッケージの実行権限。
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO c##oggtgt CONTAINER=ALL;
GRANT CREATE VIEW TO c##oggtgt CONTAINER=ALL;
GRANT SELECT ANY DICTIONARY TO c##oggtgt CONTAINER=ALL;
GRANT ALTER SYSTEM TO c##oggtgt CONTAINER=ALL;
GRANT INSERT ANY TABLE, UPDATE ANY TABLE, DELETE ANY TABLE TO c##oggtgt CONTAINER=ALL;
GRANT OGG_APPLY TO c##oggtgt CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_CAPTURE_ADM TO c##oggtgt CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM TO c##oggtgt CONTAINER=ALL;

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
