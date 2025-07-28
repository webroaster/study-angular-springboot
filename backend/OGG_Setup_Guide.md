# Oracle GoldenGate (OGG) Docker 環境セットアップとデータ同期ガイド

このドキュメントでは、`docker-compose` を使用して Oracle GoldenGate のレプリケーション環境を構築し、アプリケーションスキーマ (`appuser`) のデータを同期するための手順を解説します。

## 1. 環境セットアップ

### 1.1. `docker-compose.yaml` の設定

`docker-compose.yaml` は、ソースデータベース (`db-source`)、ターゲットデータベース (`db-target`)、および Oracle GoldenGate (`ogg`) サービスを定義します。

```yaml
version: "3.8"

services:
  db-source:
    image: oracle/database:23.6.0-free
    container_name: demo_db_source
    ports:
      - 1521:1521
    volumes:
      - db-source-store:/opt/oracle/oradata
      - ./src/main/resources/schemas/setup:/opt/oracle/scripts/setup # 初期化SQLをマウント
      - ./listener.ora:/opt/oracle/product/23ai/dbhomeFree/network/admin/listener.ora
    environment:
      - ORACLE_PWD=password # SYS, SYSTEM, PDBADMIN のパスワード

  db-target:
    image: oracle/database:23.6.0-free
    container_name: demo_db_target
    ports:
      - 1522:1521 # ホスト側ポートを1522にマッピング
    volumes:
      - db-target-store:/opt/oracle/oradata
      - ./src/main/resources/schemas/setup:/opt/oracle/scripts/setup # 初期化SQLをマウント
    environment:
      - ORACLE_PWD=password

  app: # アプリケーションサービス (OGGとは直接関係なし)
    build:
      context: .
      dockerfile: Dockerfile
    container_name: demo_app
    ports:
      - "8080:8080"
    depends_on:
      - db-source

  ogg:
    image: oracle/goldengate:23.4
    container_name: demo_ogg
    depends_on:
      - db-source
      - db-target # DBサービスに依存
    volumes:
      # tnsnames.ora を GoldenGate が参照するパスにマウント
      - ./tnsnames.ora:/u01/ogg/lib/instantclient/network/admin/tnsnames.ora
      # - ./ogg_config_data:/u02/Deployment # OGG設定の永続化 (今回はマウントしない方針)
    environment:
      # - TNS_ADMIN=/u01/ogg/lib/instantclient # tnsnames.ora のパスを指定 (今回は直接マウントするため不要)
      - OGG_ADMIN=oggadmin # OGG管理ユーザー名
      - OGG_ADMIN_PWD=P@ssw0rd1 # OGG管理ユーザーパスワード
      # - ORACLE_HOME=/u01/ogg # OGGのホームディレクトリ (通常は自動設定)
      # - ORACLE_SID=FREEPDB1 # OGGが接続するSID (tnsnames.ora で解決)
    ports:
      - "9011:9011" # OGG管理サービスのポート
      - "80:80" # OGG Web UIのポート (今回は使用しない)

volumes: # Dockerボリューム定義 (DBデータの永続化用)
  db-source-store:
  db-target-store:
```

### 1.2. `tnsnames.ora` の設定

`tnsnames.ora` は、GoldenGate がデータベースに接続するための接続情報を定義します。

```ora
SOURCE_DB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = db-source)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = FREEPDB1)
    )
  )

TARGET_DB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = db-target)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = FREEPDB1)
    )
  )
```

- **`SOURCE_DB` / `TARGET_DB`**: 接続識別子。GoldenGate からデータベースに接続する際に使用します。
- **`HOST = db-source` / `db-target`**: `docker-compose.yaml` で定義されたサービス名です。Docker ネットワーク内でコンテナ名として解決されます。
- **`PORT = 1521`**: Oracle データベースのデフォルトリスナーポートです。
- **`SERVICE_NAME = FREEPDB1`**: Oracle 23c Free Edition のデフォルトのプラガブルデータベース (PDB) 名です。

### 1.3. `01_init_user.sql` の設定

この SQL スクリプトは、データベースコンテナ起動時に自動的に実行され、GoldenGate がデータベース操作を行うために必要なユーザーと権限を設定します。

```sql
-- =================================================================
-- CDB$ROOT (コンテナ・データベース・ルート) で実行されるコマンド
-- =================================================================
-- このスクリプトは、自動的にCDB$ROOTにSYSDBAとして接続された状態で実行されます。

-- 1. GoldenGateレプリケーションを有効化 (CDB$ROOTでの実行が必須)
--    このパラメータをTRUEに設定することで、GoldenGateがデータベースの変更をキャプチャできるようになります。
ALTER SYSTEM SET ENABLE_GOLDENGATE_REPLICATION=TRUE SCOPE=BOTH;

-- データベースをマウント状態にしてからARCHIVELOGモードを有効にし、再度オープンします。
SHUTDOWN IMMEDIATE;
STARTUP MOUNT;
ALTER DATABASE ARCHIVELOG;
ALTER DATABASE ADD SUPPLEMENTAL LOG DATA;
ALTER DATABASE OPEN;

-- DBA_RECYCLEBIN のパージを無効化
ALTER SYSTEM SET "_recyclebin_retention_time" = 0 SCOPE=SPFILE;
-- Logmining Serverの並列度を設定
ALTER SYSTEM SET "_log_parallelism_max" = 8 SCOPE=SPFILE;

-- Logminerの起動に必要な追加パラメータ
ALTER SYSTEM SET "_enable_logminer_parallel_capture" = TRUE SCOPE=SPFILE;

-- Logminer辞書の再構築 (Integrated ExtractがLogminerを自動起動しない場合に試す)
-- これは、Logminer辞書が破損している場合に有効
EXEC DBMS_LOGMNR_D.BUILD(options => DBMS_LOGMNR_D.STORE_IN_DB);

-- 2. GoldenGate用の共通ユーザーを作成 (Oracle 12c以降の命名規則に従い、接頭辞 C## が必須)
--    CONTAINER=ALL を指定することで、全てのコンテナで利用可能な共通ユーザーとなります。
CREATE USER c##ggadmin IDENTIFIED BY password CONTAINER=ALL;

-- 3. 共通ユーザーに基本的な権限を全てのコンテナで付与
--    CONNECT: データベースへの接続権限
--    RESOURCE: オブジェクト作成権限
--    UNLIMITED TABLESPACE: 表領域の使用制限なし
--    CREATE VIEW: ビュー作成権限
--    SELECT ANY DICTIONARY: データディクショナリへの参照権限 (変更キャプチャに必要)
--    ALTER SYSTEM: システムパラメータ変更権限 (GoldenGateの操作に必要)
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO c##ggadmin CONTAINER=ALL;
GRANT CREATE VIEW TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ANY DICTIONARY TO c##ggadmin CONTAINER=ALL;
GRANT ALTER SYSTEM TO c##ggadmin CONTAINER=ALL;

-- 4. Oracle 23c の新しいロールベースの権限モデルを使用して権限を付与
--    DBMS_GOLDENGATE_AUTH.GRANT_ADMIN_PRIVILEGE プロシージャは23cで廃止されたため、
--    OGG_CAPTURE と OGG_APPLY ロールを直接GRANTします。
--    OGG_CAPTURE: Extractプロセス(変更データ取得)に必要な権限
--    OGG_APPLY: Replicatプロセス(変更データ適用)に必要な権限
GRANT OGG_CAPTURE TO c##ggadmin CONTAINER=ALL;
GRANT OGG_APPLY TO c##ggadmin CONTAINER=ALL;

-- 5. 念のため、特定のパッケージに対する実行権限を明示的に付与
--    これらのパッケージはGoldenGateの内部処理で利用されます。
GRANT EXECUTE ON SYS.DBMS_CAPTURE_ADM TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON SYS.DBMS_XSTREAM_GG_ADM TO c##ggadmin CONTAINER=ALL;
-- Logmining Server関連の追加権限付与 (念のため)
GRANT SELECT ON V_$DATABASE TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$ARCHIVED_LOG TO c##ggadmin CONTAINER=ALL;
GRANT SELECT ON V_$LOGMNR_CONTENTS TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR TO c##ggadmin CONTAINER=ALL;
GRANT EXECUTE ON DBMS_LOGMNR_D TO c##ggadmin CONTAINER=ALL;


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
```

## 2. GoldenGate 初期設定 (コンテナ起動後)

`docker-compose up -d` でコンテナを起動した後、`adminclient` を使って GoldenGate のプロセスを設定します。

1.  **OGG コンテナに入り、`adminclient` を起動:**

    ```bash
    docker exec -it demo_ogg bash
    /u01/ogg/bin/adminclient
    ```

2.  **OGG 管理サービスに接続:**

    ```
    OGG (not connected) 1> connect http://localhost:9011 as oggadmin password P@ssw0rd1
    ```

    - `oggadmin` は `docker-compose.yaml` で設定した OGG 管理ユーザーです。

    **資格証明ストアの設定**: GoldenGate がデータベースに接続するためのユーザー名とパスワードを安全に保存します。

    ```
    OGG (http://localhost:9011 Local) 2> alter credentialstore add user c##ggadmin@SOURCE_DB password password alias ogg_src
    OGG (http://localhost:9011 Local) 3> alter credentialstore add user c##ggadmin@TARGET_DB password password alias ogg_tgt
    ```

    - `c##ggadmin`: データベースに作成した GoldenGate 用ユーザー。
    - `SOURCE_DB` / `TARGET_DB`: `tnsnames.ora` で定義した接続識別子。
    - `password`: `c##ggadmin` ユーザーのパスワード。
    - `ogg_src` / `ogg_tgt`: 資格証明ストア内で使用するエイリアス名。

    確認コマンド

    ```
    INFO CREDENTIALSTORE

    Default domain: OracleGoldenGate

    Alias: ogg_src
    Userid: c##ggadmin@SOURCE_DB

    Alias: ogg_tgt
    Userid: c##ggadmin@TARGET_DB
    ```

3.  **データベースログインの確認:**
    設定した資格情報でデータベースに接続できるか確認します。

    ```
    OGG (http://localhost:9011 Local) 4> dblogin useridalias ogg_src
    ```

    - `Successfully logged into database.` と表示されれば成功です。

4.  **スキーマレベルのトランザクションデータ有効化:**
    GoldenGate が特定のスキーマの変更をキャプチャできるように、データベースの補助ログを有効にします。

    ```
    OGG (http://localhost:9011 Local as ogg_src@FREE) 5> add schematrandata appuser
    ```

    - `appuser`: 変更をキャプチャする対象のスキーマ名。

5.  **変更同期用 Extract (EXT1) の作成:**
    ソース DB の**継続的な変更**を抽出するプロセスです。

    ```
    OGG (http://localhost:9011 Local as ogg_src@FREE) 6> add extract EXT1, integrated tranlog, begin now
    OGG (http://localhost:9011 Local as ogg_src@FREE) 7> add exttrail ./dirdat/e1, extract EXT1
    OGG (http://localhost:9011 Local as ogg_src@FREE) 8> edit params EXT1
    ```

    エディタで以下の内容を記述し、`appuser` スキーマのみを対象にします。

    ```
    extract EXT1
    useridalias ogg_src
    exttrail ./dirdat/e1
    table appuser.*;
    ```

    - `EXT1`: Extract プロセスの名前
    - `INTEGRATED TRANLOG`: 統合キャプチャモードでトランザクションログから変更を読み取ります
    - `BEGIN NOW`: 現在時刻から変更のキャプチャを開始します
    - `exttrail ./dirdat/e1`: 抽出した変更を書き出す証跡ファイルの名前とパス
    - `table appuser.*;`: `appuser` スキーマ内全てのテーブルの変更をキャプチャ対象とする

6.  **Extract (EXT1) のデータベース登録:**

    ```
    OGG (http://localhost:9011 Local as ogg_src@FREE) 9> register extract EXT1 database
    ```

    - `EXT1`: 登録する Extract プロセスの名前
    - `DATABASE`: データベースに登録することを指定します

7.  **変更同期用 Replicat (REP1) の作成:**
    ターゲット DB に**継続的な変更**を適用するプロセスです。

    ```
    OGG (http://localhost:9011 Local as ogg_src@FREE) 10> dblogin useridalias ogg_tgt
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 11> add checkpointtable c##ggadmin.checkpoint
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 12> add replicat REP1, exttrail ./dirdat/e1, checkpointtable c##ggadmin.checkpoint
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 13> edit params REP1
    ```

    - `dblogin useridalias ogg_tgt`: ターゲット DB に接続を切り替えます
    - `add checkpointtable c##ggadmin.checkpoint`: Replicat の処理状況を記録するチェックポイントテーブルを作成します
    - `edit params REP1` 実行後、エディタが開くので以下の内容を記述して保存・終了します

    ```
    replicat REP1
    useridalias ogg_tgt
    map appuser.*, target appuser.*;
    ```

    - `REP1`: Replicat プロセスの名前
    - `exttrail ./dirdat/e1`: 読み込む証跡ファイルの名前
    - `map appuser.*, target appuser.*;`: ソースの `appuser` スキーマの全てのテーブルを、ターゲットの `appuser` スキーマの同名テーブルにマッピングします

## 3. データ同期の仕組み

- **Extract (抽出プロセス)**: ソースデータベースのトランザクションログ（REDO ログ）を読み取り、設定されたルールに基づいて変更データ（DML/DDL）を抽出します。抽出されたデータは「証跡ファイル (Trail File)」に書き込まれます。
- **証跡ファイル (Trail File)**: Extract プロセスによって生成される、変更データが格納された中間ファイルです。このファイルは、Extract と Replicat の間でデータを転送するための主要なメカニズムです。
- **Replicat (適用プロセス)**: 証跡ファイルを読み取り、抽出された変更データをターゲットデータベースに適用します。これにより、ソースとターゲットのデータが同期されます。
- **チェックポイントテーブル**: Replicat プロセスがどこまでデータを適用したかを記録するために使用されます。これにより、Replicat が停止しても、再開時に中断した時点から処理を継続できます。

## 4. 初期ロードと継続的なデータ同期の実行

`appuser` スキーマのように、**既にデータが存在するテーブル**を初めて同期する場合、「初期ロード」が必要です。ここでは GoldenGate の機能を使ってオンラインで初期ロードを実行します。

### 4.1. 前提

- ソース DB の `appuser` スキーマには `todos` テーブルとデータが存在する。
- ターゲット DB の `appuser` スキーマは空（テーブルもデータもない状態）。
- セクション 2 で作成した `EXT1` と `REP1` は `STOPPED` 状態であること。

### 4.2. 初期ロード用プロセスの作成 (`adminclient`内)

1.  **初期ロード用 Extract (IEXT) を作成:**
    テーブルから直接データを読み込むための特別な Extract です。

    ```
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 1> dblogin useridalias ogg_src
    OGG (http://localhost:9011 Local as ogg_src@FREE) 2> add extract IEXT, sourceistable
    OGG (http://localhost:9011 Local as ogg_src@FREE) 3> edit params IEXT
    ```

    エディタでロード対象のテーブルと**証跡ファイル**を指定します。

    ```
    extract IEXT
    useridalias ogg_src
    exttrail ./dirdat/i1
    table appuser.todos;
    ```

2.  **初期ロード用 Replicat (IREP) を作成:**
    初期ロード用の証跡ファイルをターゲット DB に適用する Replicat です。
    ```
    OGG (http://localhost:9011 Local as ogg_src@FREE) 4> dblogin useridalias ogg_tgt
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 5> add replicat IREP, exttrail ./dirdat/i1, checkpointtable c##ggadmin.checkpoint
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 6> edit params IREP
    ```
    エディタでマッピングを設定します。
    ```
    replicat IREP
    useridalias ogg_tgt
    map appuser.todos, target appuser.todos;
    ```

### 4.3. 実行フロー

以下の順序で各プロセスを起動することが重要です。

1.  **変更キャプチャを開始:**
    まず、継続的な変更を捉える `EXT1` を起動します。これにより、初期ロード中に発生した変更も漏らさずキャプチャできます。

    ```
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 7> start extract EXT1
    ```

2.  **初期ロードを実行:**
    `IEXT` (抽出) と `IREP` (適用) を順に実行します。これらはタスクが完了すると自動で停止します。

    ```
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 8> start extract IEXT
    -- info extract IEXT で進捗を確認。STATUSがSTOPPED (At EOF) になれば完了。

    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 9> start replicat IREP
    -- info replicat IREP で進捗を確認。STATUSがSTOPPED (At EOF) になれば完了。
    ```

3.  **変更の適用を開始:**
    初期ロードが完了したら、`EXT1` が溜めていた変更を適用するために `REP1` を起動します。
    ```
    OGG (http://localhost:9011 Local as ogg_tgt@FREE) 10> start replicat REP1
    ```
    `info all` を実行し、`EXT1` と `REP1` が `RUNNING` 状態になっていれば、セットアップは完了です。

### 4.4. データ同期の確認

1.  **ターゲット DB で初期データを確認:**
    `docker exec -it demo_db_target bash` でコンテナに入り、`sqlplus appuser/password@FREEPDB1` で接続して確認します。

    ```bash
    docker exec -it demo_db_source bash
    sqlplus appuser/password@FREEPDB1
    ```

    ```sql
    SELECT COUNT(*) FROM todos;
    ```

2.  **継続的な同期を確認:**
    `docker exec -it demo_db_source bash` でソース DB に接続し、データを一件追加します。

    ```bash
    docker exec -it demo_db_source bash
    sqlplus appuser/password@FREEPDB1
    ```

    ```sql
    -- sqlplus appuser/password@FREEPDB1
    INSERT INTO todos (id, title, completed) VALUES (99, 'init load test', 1);
    COMMIT;
    ```

    その後、再度ターゲット DB で `SELECT * FROM todos WHERE id = 99;` を実行し、新しいデータが同期されていることを確認します。

    ```bash
    docker exec -it demo_db_target bash
    sqlplus appuser/password@FREEPDB1
    ```

    ```sql
    SELECT * FROM todos WHERE id = 99;
    ```
