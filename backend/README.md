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

### テストの実行

バックエンドのテストを実行するには、`backend` ディレクトリから以下のコマンドを実行します。

```bash
./mvnw test
```
