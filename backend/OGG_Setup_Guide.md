# Oracle GoldenGate (OGG) Docker 環境セットアップとデータ同期ガイド

このドキュメントでは、`docker-compose` を使用して Oracle GoldenGate のレプリケーション環境を構築し、アプリケーションスキーマ (`appuser`) のデータを、**初期ロード**と**継続的な同期**の両方を含めてセットアップする手順を解説します。

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

### 1.3. データベース初期化スクリプトの設定

`src/main/resources/schemas/setup/` ディレクトリ内の以下の SQL スクリプトは、データベースコンテナ起動時に自動的に実行され、GoldenGate がデータベース操作を行うために必要なユーザーと権限を設定します。

- **`01_init_source_db.sql`**: ソースデータベース (`db-source`) 用の初期化スクリプトです。GoldenGate の Extract プロセスが変更をキャプチャするために必要な権限 (`c##oggsrc` ユーザー) と、アプリケーションユーザー (`appuser`) の作成が含まれます。
- **`01_init_target_db.sql`**: ターゲットデータベース (`db-target`) 用の初期化スクリプトです。GoldenGate の Replicat プロセスが変更を適用するために必要な権限 (`c##oggtgt` ユーザー) と、アプリケーションユーザー (`appuser`) の作成が含まれます。
- **`02_create_source_tables.sql`**: ソースデータベースの `appuser` スキーマに `users` テーブルを作成します。
- **`02_create_target_tables.sql`**: ターゲットデータベースの `appuser` スキーマに `users` テーブルと `todos` テーブルを作成します。
- **`03_init_source_data.sql`**: ソースデータベースの `users` テーブルと `todos` テーブルに初期データを投入します。
- **`03_init_target_data.sql`**: ターゲットデータベースの `todos` テーブルに初期データを投入します。`users` テーブルのデータは初期ロードで転送されるため、ここでは含めません。

## 2. GoldenGate 初期設定 (コンテナ起動後)

`docker-compose up -d` でコンテナを起動した後、`adminclient` を使って GoldenGate のプロセスを設定します。

1.  **OGG コンテナに入り、`adminclient` を起動:**

    ```bash
    docker exec -it demo_ogg bash
    /u01/ogg/bin/adminclient
    ```

2.  **OGG 管理サービスに接続し、資格情報を設定:**

    - `oggadmin` は `docker-compose.yaml` で設定した OGG 管理ユーザーです。

    ```
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    alter credentialstore add user c##oggsrc@SOURCE_DB password password alias ogg_src
    alter credentialstore add user c##oggtgt@TARGET_DB password password alias ogg_tgt
    ```

    - `c##oggsrc`: ソースデータベースに作成した GoldenGate 用ユーザー。
    - `c##oggtgt`: ターゲットデータベースに作成した GoldenGate 用ユーザー。
    - `SOURCE_DB / TARGET_DB`: `tnsnames.ora` で定義した接続識別子。
    - `password`: `c##ggadmin` ユーザーのパスワード。
    - `ogg_src / ogg_tgt`: 資格証明ストア内で使用するエイリアス名。

    確認コマンド

    ```
    INFO CREDENTIALSTORE

    Default domain: OracleGoldenGate

    Alias: ogg_src
    Userid: c##oggsrc@SOURCE_DB

    Alias: ogg_tgt
    Userid: c##oggtgt@TARGET_DB
    ```

3.  **継続的な変更同期用のプロセス (EXT1, REP1) を作成:**

    **データベースログイン**

    ```
    dblogin useridalias ogg_src
    ```

    **スキーマの補助ログを有効化**

    ```
    add schematrandata appuser
    ```

    **継続的な変更をキャプチャする Extract(EXT1) を作成**

    ```
    add extract EXT1, integrated tranlog, begin now
    add exttrail ./dirdat/e1, extract EXT1
    edit params EXT1
    ```

    エディタで以下の内容を記述

    ```
    extract EXT1
    useridalias ogg_src
    exttrail ./dirdat/e1
    table appuser.users;
    ```

    - `EXT1`: Extract プロセスの名前
    - `INTEGRATED TRANLOG`: 統合キャプチャモードでトランザクションログから変更を読み取ります
    - `BEGIN NOW`: 現在時刻から変更のキャプチャを開始します
    - `exttrail ./dirdat/e1`: 抽出した変更を書き出す証跡ファイルの名前とパス
    - `table appuser.*;`: `appuser` スキーマ内全てのテーブルの変更をキャプチャ対象とする

    **Extract を DB に登録**

    ```
    register extract EXT1 database
    ```

    - `EXT1`: 登録する Extract プロセスの名前
    - `DATABASE`: データベースに登録することを指定します

    **ターゲット DB に接続**

    ```
    dblogin useridalias ogg_tgt
    ```

    **チェックポイントテーブルを作成**

    ```
    add checkpointtable c##oggtgt.checkpoint
    ```

    **継続的な変更を適用する Replicat (REP1) を作成**

    ```
    add replicat REP1, exttrail ./dirdat/e1, checkpointtable c##oggtgt.checkpoint
    edit params REP1
    ```

    - `add checkpointtable c##oggtgt.checkpoint`: `Replicat` の処理状況を記録するチェックポイントテーブルを作成します

    エディタで以下の内容を記述

    ```
    replicat REP1
    useridalias ogg_tgt
    map appuser.users, target appuser.users;
    ```

    - `REP1`: Replicat プロセスの名前
    - `exttrail ./dirdat/e1`: 読み込む証跡ファイルの名前
    - `map appuser.*, target appuser.*;`: ソースの `appuser` スキーマの全てのテーブルを、ターゲットの `appuser` スキーマの同名テーブルにマッピングします

## 2.1. 初期ロードの実行 (users テーブルのみ)

既存のデータをソース DB からターゲット DB へ一度だけ転送します。

**注意:** 以下の手順を実行する前に、もし以前の初期ロードプロセスが残っている場合は削除してください。

```
delete extract EXT_IL
delete replicat REP_IL
```

**データベースログイン (ソース DB)**

```
dblogin useridalias ogg_src
```

1.  **初期ロード用 Extract (EXT_IL) を作成:**

    ```
    add extract EXT_IL, sourceistable
    edit params EXT_IL
    ```

    エディタで以下の内容を記述

    ```
    extract EXT_IL
    useridalias ogg_src
    exttrail ./dirdat/il
    table appuser.users;
    ```

    - `EXT_IL`: 初期ロード用 Extract プロセスの名前
    - `SOURCEISTABLE`: ソーステーブルから直接データを抽出することを示します。Extract がすべてのデータを処理し終えると自動的に停止します。
    - `exttrail ./dirdat/il`: 初期ロードで抽出した変更を書き出す証跡ファイルの名前とパス
    - `table appuser.users;`: `appuser.users` テーブルのみを初期ロードの対象とする

**データベースログイン (ターゲット DB)**

```
dblogin useridalias ogg_tgt
```

2.  **初期ロード用 Replicat (REP_IL) を作成:**

    ```
    add replicat REP_IL, specialrun, exttrail ./dirdat/il
    edit params REP_IL
    ```

    エディタで以下の内容を記述

    ```
    replicat REP_IL
    useridalias ogg_tgt
    map appuser.users, target appuser.users;
    ```

    - `REP_IL`: 初期ロード用 Replicat プロセスの名前
    - `SPECIALRUN`: 初期ロード専用の Replicat であることを示します。Replicat がすべてのデータを処理し終えると自動的に停止します。
    - `exttrail ./dirdat/il`: 読み込む証跡ファイルの名前
    - `map appuser.users, target appuser.users;`: ソースの `appuser.users` テーブルを、ターゲットの `appuser.users` テーブルにマッピングします
    ```

    - `REP_IL`: 初期ロード用 Replicat プロセスの名前
    - `SPECIALRUN`: 初期ロード専用の Replicat であることを示します。Replicat がすべてのデータを処理し終えると自動的に停止します。
    - `exttrail ./dirdat/il`: 読み込む証跡ファイルの名前
    - `map appuser.users, target appuser.users;`: ソースの `appuser.users` テーブルを、ターゲットの `appuser.users` テーブルにマッピングします

3.  **初期ロードプロセスを開始:**

    ```
    start extract EXT_IL
    start replicat REP_IL
    ```

4.  **プロセスの状態を確認:**
    `info all` コマンドで、`EXT_IL` と `REP_IL` の `Status` が `STOPPED` になっていることを確認します。これは `SPECIALRUN` オプションにより、処理完了後に自動停止するためです。

    ```
    info all
    ```

5.  **ターゲット DB で `users` テーブルのデータを確認:**

    ```bash
    docker exec -it demo_db_target bash
    sqlplus appuser/password@FREEPDB1
    -- SQLプロンプトで以下を実行
    SELECT * FROM users;
    ```

    ソース DB の `users` テーブルのデータがターゲット DB に転送されていれば、初期ロードは成功です。

## 3. データ同期の実行と確認

1.  **同期プロセスを開始:**
    作成した Extract と Replicat を起動します。

    ```
    start extract EXT1
    start replicat REP1
    ```

2.  **プロセスの状態を確認:**
    `info all` コマンドで、`EXT1` と `REP1` の `Status` が `RUNNING` になっていることを確認します。

    ```
    info all
    ```

3.  **データ同期をテスト:**
    ソース DB にデータを挿入し、ターゲット DB に反映されるかを確認します。

    - **ソース DB に接続してデータを挿入:**

      ```bash
      docker exec -it demo_db_source bash
      sqlplus appuser/password@FREEPDB1
      -- SQLプロンプトで以下を実行
      INSERT INTO todos (id, title, completed) VALUES (99, 'init load test', 1);
      COMMIT;
      EXIT;
      ```

    - **ターゲット DB に接続してデータを確認:**
      ```bash
      docker exec -it demo_db_target bash
      sqlplus appuser/password@FREEPDB1
      -- SQLプロンプトで以下を実行
      SELECT * FROM todos WHERE id = 99;
      ```
      ソースで挿入したレコードが表示されれば、継続的なデータ同期は正常に動作しています。
