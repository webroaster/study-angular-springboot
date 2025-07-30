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

1.  **OGG 管理サービスに接続し、資格情報を設定:**

    - `oggadmin` は `docker-compose.yaml` で設定した OGG 管理ユーザーです。

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    alter credentialstore add user c##oggsrc@SOURCE_DB password password alias ogg_src
    alter credentialstore add user c##oggtgt@TARGET_DB password password alias ogg_tgt
    EOF
    ```

    - `c##oggsrc`: ソースデータベースに作成した GoldenGate 用ユーザー。
    - `c##oggtgt`: ターゲットデータベースに作成した GoldenGate 用ユーザー。
    - `SOURCE_DB / TARGET_DB`: `tnsnames.ora` で定義した接続識別子。
    - `password`: `c##ggadmin` ユーザーのパスワード。
    - `ogg_src / ogg_tgt`: 資格証明ストア内で使用するエイリアス名。

    確認コマンド

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    INFO CREDENTIALSTORE
    EOF
    ```

    出力例:

    ```
    Default domain: OracleGoldenGate

    Alias: ogg_src
    Userid: c##oggsrc@SOURCE_DB

    Alias: ogg_tgt
    Userid: c##oggtgt@TARGET_DB
    ```

2.  **継続的な変更同期用のプロセス (EXT1, REP1) を作成:**

    **スキーマの補助ログを有効化**

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    dblogin useridalias ogg_src
    add schematrandata appuser
    EOF
    ```

    **継続的な変更をキャプチャする Extract(EXT1) のパラメータファイルを作成**

    OGG コンテナ内で以下のコマンドを実行し、`EXT1.prm` ファイルを作成します。

    ```bash
    docker exec demo_ogg bash -c "echo -e 'extract EXT1\nuseridalias ogg_src\nexttrail /u02/Deployment/var/lib/data/dirdat/e1\ntable appuser.users;' > /u02/Deployment/etc/conf/ogg/EXT1.prm"
    ```

    **`EXT1.prm` の内容:**

    ```
    extract EXT1
    useridalias ogg_src
    exttrail /u02/Deployment/var/lib/data/dirdat/e1
    table appuser.users;
    ```

    - `EXT1`: Extract プロセスの名前
    - `useridalias ogg_src`: ソースデータベースへの接続に使用する資格証明ストアのエイリアス
    - `exttrail ./dirdat/e1`: 抽出した変更を書き出す証跡ファイルの名前とパス
    - `table appuser.users;`: `appuser.users` テーブルの変更をキャプチャ対象とする

    **継続的な変更を適用する Replicat (REP1) のパラメータファイルを作成**

    OGG コンテナ内で以下のコマンドを実行し、`REP1.prm` ファイルを作成します。

    ```bash
    docker exec demo_ogg bash -c "echo -e 'replicat REP1\nuseridalias ogg_tgt\nmap appuser.users, target appuser.users;' > /u02/Deployment/etc/conf/ogg/REP1.prm"
    ```

    **`REP1.prm` の内容:**

    ```
    replicat REP1
    useridalias ogg_tgt
    map appuser.users, target appuser.users;
    ```

    - `REP1`: Replicat プロセスの名前
    - `useridalias ogg_tgt`: ターゲットデータベースへの接続に使用する資格証明ストアのエイリアス
    - `map appuser.users, target appuser.users;`: ソースの `appuser.users` テーブルを、ターゲットの `appuser.users` テーブルにマッピングする

    **Extract (EXT1) を作成し、DB に登録**

    `adminclient` プロンプトで以下を実行します。

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    dblogin useridalias ogg_src
    add extract EXT1, integrated tranlog, begin now
    register extract EXT1 database
    add exttrail /u02/Deployment/var/lib/data/dirdat/e1, extract EXT1
    EOF
    ```

    - `EXT1`: 登録する Extract プロセスの名前
    - `DATABASE`: データベースに登録することを指定します
    - `add exttrail ...`: 抽出した変更を書き出す証跡ファイルを Extract に割り当てます。

    **チェックポイントテーブルを作成し、Replicat (REP1) を作成**

    `adminclient` プロンプトで以下を実行します。

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    dblogin useridalias ogg_tgt
    add checkpointtable c##oggtgt.checkpoint
    add replicat REP1, exttrail /u02/Deployment/var/lib/data/dirdat/e1, checkpointtable c##oggtgt.checkpoint
    EOF
    ```

    - `add checkpointtable c##oggtgt.checkpoint`: `Replicat` の処理状況を記録するチェックポイントテーブルを作成します

## 2.1. 初期ロードの実行 (Instantiation CSN を利用したベストプラクティス)

ここでは、Oracle が推奨する **Instantiation CSN** を利用した方法で、`users` テーブルの初期ロードを行います。この方法は、Oracle Data Pump (`expdp`/`impdp`) と GoldenGate を連携させ、初期ロード中のデータと差分更新データの重複適用を Replicat プロセスが自動的に回避する、最も安全で信頼性の高い方式です。

以前の手動による初期ロードプロセス (`EXT_IL`, `REP_IL`) は不要です。

### 手順

1.  **Replicat パラメータの更新 (`ENABLE_INSTANTIATION_FILTERING`)**

    継続同期用の Replicat (`REP1`) が、Data Pump でロードされたデータを認識し、重複適用をスキップできるように、パラメータファイルに `DBOPTIONS ENABLE_INSTANTIATION_FILTERING` を追加します。

    ```bash
    docker exec demo_ogg bash -c "echo -e 'replicat REP1\nuseridalias ogg_tgt\nDBOPTIONS ENABLE_INSTANTIATION_FILTERING\nmap appuser.users, target appuser.users;' > /u02/Deployment/etc/conf/ogg/REP1.prm"
    ```

    **`REP1.prm` の内容:**

    ```
    replicat REP1
    useridalias ogg_tgt
    DBOPTIONS ENABLE_INSTANTIATION_FILTERING
    map appuser.users, target appuser.users;
    ```

2.  **Data Pump 用のディレクトリを作成**

    Data Pump がダンプファイルを読み書きするために、データベース内にディレクトリ・オブジェクトを作成し、コンテナ内に物理ディレクトリを作成します。

    ```bash
    # ソースDBとターゲットDBに物理ディレクトリを作成
    docker exec demo_db_source mkdir -p /opt/oracle/oradata/pump
    docker exec demo_db_target mkdir -p /opt/oracle/oradata/pump

    # ソースDBにディレクトリ・オブジェクトを作成し、権限を付与
    docker exec -i demo_db_source sqlplus sys/password@FREEPDB1 as sysdba <<EOF
    CREATE OR REPLACE DIRECTORY DATA_PUMP_DIR AS '/opt/oracle/oradata/pump';
    GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO appuser;
    exit;
    EOF

    # ターゲットDBにディレクトリ・オブジェクトを作成し、権限を付与
    docker exec -i demo_db_target sqlplus sys/password@FREEPDB1 as sysdba <<EOF
    CREATE OR REPLACE DIRECTORY DATA_PUMP_DIR AS '/opt/oracle/oradata/pump';
    GRANT READ, WRITE ON DIRECTORY DATA_PUMP_DIR TO appuser;
    exit;
    EOF
    ```

3.  **ソース DB からデータをエクスポート (`expdp`)**

    `db-source` コンテナ内で `expdp` コマンドを実行し、`appuser.users` テーブルのデータをエクスポートします。

    ```bash
    docker exec -it demo_db_source expdp appuser/password@FREEPDB1 tables=appuser.users directory=DATA_PUMP_DIR dumpfile=users.dmp logfile=expdp_users.log
    ```

    > **補足: 大規模データ（億単位）のロードを高速化する最適化**
    >
    > 億単位のデータを扱う場合、Data Pump の並列処理機能や圧縮機能を利用して、処理時間を大幅に短縮することが推奨されます。
    >
    > **最適化された `expdp` コマンド例:**
    > ```bash
    > docker exec -it demo_db_source expdp appuser/password@FREEPDB1 
    >   tables=appuser.users 
    >   directory=DATA_PUMP_DIR 
    >   dumpfile=users_%U.dmp 
    >   logfile=expdp_users.log 
    >   parallel=8 
    >   compression=all
    > ```
    >
    > - `parallel=8`: 処理を8並列で実行します。この値は、データベースサーバーのCPUコア数に合わせて調整してください。
    > - `dumpfile=users_%U.dmp`: `parallel` を指定した場合、ダンプファイルが複数生成されるため、`%U` を使ってファイル名を連番にします。
    > - `compression=all`: ダンプファイルを圧縮し、ディスクI/Oとネットワーク転送量を削減します。

4.  **ダンプファイルをターゲット DB コンテナに転送**

    `docker cp` コマンドを使い、エクスポートしたダンプファイル (`users.dmp`) を `db-source` コンテナからホストマシン経由で `db-target` コンテナにコピーします。
    
    > **Note:** `parallel` を使用した場合は、生成された全てのダンプファイル (`users_01.dmp`, `users_02.dmp`, ...) を転送してください。

    ```bash
    # シングルファイルの場合
    docker cp demo_db_source:/opt/oracle/oradata/pump/users.dmp .
    docker cp users.dmp demo_db_target:/opt/oracle/oradata/pump/
    rm users.dmp

    # パラレル実行で複数ファイルが生成された場合の転送例 (参考)
    # docker cp demo_db_source:/opt/oracle/oradata/pump/users_01.dmp .
    # docker cp demo_db_source:/opt/oracle/oradata/pump/users_02.dmp .
    # ...
    # docker cp users_*.dmp demo_db_target:/opt/oracle/oradata/pump/
    # rm users_*.dmp
    ```

5.  **ターゲット DB へデータをインポート (`impdp`)**

    `db-target` コンテナ内で `impdp` コマンドを実行し、転送されたダンプファイルをインポートします。

    ```bash
    docker exec -it demo_db_target impdp appuser/password@FREEPDB1 directory=DATA_PUMP_DIR dumpfile=users.dmp logfile=impdp_users.log
    ```

    > **補足: 最適化された `impdp` コマンド例:**
    >
    > エクスポート時に `parallel` を使用した場合、インポート時も同様に `parallel` を指定することで、ロード処理を高速化できます。
    >
    > ```bash
    > docker exec -it demo_db_target impdp appuser/password@FREEPDB1 
    >   directory=DATA_PUMP_DIR 
    >   dumpfile=users_%U.dmp 
    >   logfile=impdp_users.log 
    >   parallel=8
    > ```
    >
    > - `dumpfile` と `parallel` の値は、`expdp` 実行時と合わせてください。


6.  **ターゲット DB でデータを確認**

    インポートが成功したことを確認します。

    ```bash
    docker exec -it demo_db_target bash -c "sqlplus appuser/password@FREEPDB1 <<EOF
    SELECT COUNT(*) FROM users;
    exit;
    EOF"
    ```

    ソース DB の `users` テーブルと同じ件数が表示されれば、初期ロードは成功です。

## 3. データ同期の実行と確認

初期ロードが完了したので、継続的なデータ同期プロセスを開始し、動作を確認します。

1.  **同期プロセスを開始:**
    作成済みの Extract (`EXT1`) と Replicat (`REP1`) を起動します。

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    start extract EXT1
    start replicat REP1
    EOF
    ```

2.  **プロセスの状態を確認:**
    `info all` コマンドで、`EXT1` と `REP1` の `Status` が `RUNNING` になっていることを確認します。

    ```bash
    docker exec -i demo_ogg /u01/ogg/bin/adminclient <<EOF
    connect http://localhost:9011 as oggadmin password P@ssw0rd1
    info all
    EOF
    ```

3.  **データ同期をテスト:**
    ソース DB の `users` テーブルにデータを挿入し、ターゲット DB に反映されるかを確認します。

    - **ソース DB に接続してデータを挿入:**

      ```bash
      docker exec -it demo_db_source bash -c "sqlplus appuser/password@FREEPDB1 <<EOF
      INSERT INTO users (id, name, email) VALUES (4, 'new_user', 'new.user@example.com');
      COMMIT;
      exit;
      EOF"
      ```

    - **ターゲット DB に接続してデータを確認 (数秒待機):**

      ```bash
      # 同期には数秒かかる場合があります
      sleep 5

      docker exec -it demo_db_target bash -c "sqlplus appuser/password@FREEPDB1 <<EOF
      SET LINESIZE 100
      SELECT * FROM users WHERE id = 4;
      exit;
      EOF"
      ```

      ソースで挿入した `id = 4` のレコードが表示されれば、継続的なデータ同期は正常に動作しています。
