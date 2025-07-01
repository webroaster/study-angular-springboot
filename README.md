# study-angular-springboot

angular と SpringBoot の学習用リポジトリ

Gemini-CLI を使ってレッスンごとにテストファイルを作成してもらい自学習を進める。（https://github.com/google-gemini/gemini-cli?tab=readme-ov-file）

**進め方**

```txt
  バックエンドの進め方:


   1. backend ディレクトリに移動します。
   2. ./mvnw test コマンドを実行してテストが失敗することを確認します。
   3. /backend/src/main/java/com/example/demo/Lesson1Controller.java
      を開き、TODOコメントに従ってコードを実装します。
   4. 再度 ./mvnw test を実行し、テストが成功することを確認します。

  フロントエンドの進め方:


   1. frontend ディレクトリに移動します。
   2. npm install を実行して、プロジェクトの依存関係をインストールします。
   3. npm test を実行してテストが失敗することを確認します。
   4. /frontend/src/app/app.component.ts
      を開き、TODOコメントに従ってコードを実装します。
   5. 再度 npm test を実行し、テストが成功することを確認します。
```

## インストール

```sh
# gemini-cli インストール
npm install -g @google/gemini-cli
gemini --version
0.1.7

# 起動
gemini
# カラーテーマを選ぶ
# Googleログインをする


 ███            █████████  ██████████ ██████   ██████ █████ ██████   █████ █████
░░░███         ███░░░░░███░░███░░░░░█░░██████ ██████ ░░███ ░░██████ ░░███ ░░███
  ░░░███      ███     ░░░  ░███  █ ░  ░███░█████░███  ░███  ░███░███ ░███  ░███
    ░░░███   ░███          ░██████    ░███░░███ ░███  ░███  ░███░░███░███  ░███
     ███░    ░███    █████ ░███░░█    ░███ ░░░  ░███  ░███  ░███ ░░██████  ░███
   ███░      ░░███  ░░███  ░███ ░   █ ░███      ░███  ░███  ░███  ░░█████  ░███
 ███░         ░░█████████  ██████████ █████     █████ █████ █████  ░░█████ █████
░░░            ░░░░░░░░░  ░░░░░░░░░░ ░░░░░     ░░░░░ ░░░░░ ░░░░░    ░░░░░ ░░░░░


Tips for getting started:
1. Ask questions, edit files, or run commands.
2. Be specific for the best results.
3. Create GEMINI.md files to customize your interactions with Gemini.
4. /help for more information.



╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ >   Type your message or @path/to/file                                                                                                │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

## レッスン作成プロンプト
- 私は angular と SpringBoot の初心者です
- angular と SpringBoot のプロジェクトが始まるのでそのキャッチアップとして、理解を深めたいです
- 私の学習教材を作ってください
- lesson形式でlesson1-1ファイルに対してtest/lesson1-1ファイルを実行してテストを通すことで学習を進めていきます
- lessonはおおよそ5つぐらい作ってください
- テストライブラリーはangularとSpringBootの知識がないため一般的なテストライブラリを教えてください
```
