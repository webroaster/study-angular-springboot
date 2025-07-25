# バックエンドアプリケーション

このディレクトリには、Spring Boot バックエンドアプリケーションが含まれています。

## 前提条件

アプリケーションを実行する前に、以下がインストールされていることを確認してください。

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 実行方法

PostgreSQL データベースとデータベース管理用の Adminer とともにバックエンドアプリケーションをビルドして実行するには、この `backend` ディレクトリに移動し、Docker Compose を使用します。

1.  **backend ディレクトリに移動します。**

    ```bash
    cd backend
    ```

2.  **サービスをビルドして起動します。**
    `-d` フラグは、コンテナをデタッチモード（バックグラウンド）で実行します。

    ```bash
    docker-compose up --build -d
    ```

    クリーンなデータベースで開始したい場合（例: `schema.sql` またはデータベース設定に関連する `application.properties` を変更した後）は、まず既存のボリュームを削除することをお勧めします。

    ```bash
    docker-compose down -v
    docker-compose up --build -d
    ```

3.  **サービスを停止します。**
    ```bash
    docker-compose down
    ```

## サービスへのアクセス

Docker コンテナが実行されたら、以下のサービスにアクセスできます。

- **バックエンド API:** `http://localhost:8080`
- **Swagger UI (API ドキュメント):** `http://localhost:8080/swagger-ui.html`
- **Adminer (データベース GUI):** `http://localhost:8082`
  - **システム:** `PostgreSQL`
  - **サーバー:** `db`
  - **ユーザー名:** `user`
  - **パスワード:** `password`
  - **データベース:** `mydatabase`

## 開発

### DB 接続（Docker コンテナ）

```bash
docker exec -it demo_db_source bash -c "export NLS_LANG=JAPANESE_JAPAN.AL32UTF8; sqlplus appuser/password@//localhost:1521/FREEPDB1"

SQL> SELECT table_name FROM user_tables;

TABLE_NAME
------------------------------
TODOS
USERS

SQL> DESCRIBE USERS;
 名前                                    NULL?    型
 ----------------------------------------- -------- ----------------------------
 ID                                        NOT NULL NUMBER(10)
 USERNAME                                  NOT NULL VARCHAR2(255)
 DISPLAY_NAME                                       VARCHAR2(255)
 PASSWORD                                           VARCHAR2(30)
 STATUS                                             VARCHAR2(10)

# SwaggerUI でデータ追加後確認
SQL> SELECT * FROM USERS;

        ID
----------
USERNAME
--------------------------------------------------------------------------------
DISPLAY_NAME
--------------------------------------------------------------------------------
PASSWORD                       STATUS
------------------------------ ----------
         1
admin
���������
password                       enable

SQL>
```

### コード自動生成

`openapi.yaml` や `mybatis-generator-config.xml` の変更を反映し、DTO、API インターフェース、DB エンティティ、MyBatis マッパーを自動生成するには、以下のコマンドをホストマシン上で実行します。

```bash
# OpenAPI Generator で DTO, API インターフェースを自動生成
./mvnw generate-sources

# MyBatis Generator で Entity, Mapper を自動生成
# ⚠️ 実行する際は、docker で DB を起動しておく必要がある
docker-compose up --build
./mvnw mybatis-generator:generate
```

- `./mvnw generate-sources` を実行すると、`target/generated-sources` に一時的にファイルが生成された後、必要な Java ファイルが `src/main/java/com/example/fidodemo/api` および `src/main/java/com/example/fidodemo/dto` にコピーされ、IDE がそれらを認識できるようになります。
- `./mvnw mybatis-generator:generate` を実行すると、`src/main/java/com/example/fidodemo/entity/` および `src/main/java/com/example/fidodemo/mapper/` に自動生成ファイルが作成されます。
- MyBatis Generator は、その設計上、稼働中のデータベースに接続してスキーマを読み取る（イントロスペクトする）ことでコードを生成します。そのため、`./mvnw mybatis-generator:generate` を実行する際は、ホストマシンからアクセス可能なデータベースが起動している必要があります。

### データベーススキーマの自動適用

- `src/main/resources/schemas/setup/` に定義されたファイルは、Docker コンテナ起動時 1 度だけ Oracle に適用されます。
- `src/main/resources/schemas/startup/` に定義されたファイルは、Docker コンテナ起動時に毎回実行されます。

### テストの実行

バックエンドのテストを実行するには、`backend` ディレクトリから以下のコマンドを実行します。

```bash
./mvnw test
```
