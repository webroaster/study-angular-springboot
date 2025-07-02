# study-angular-springboot

angular と SpringBoot の学習用リポジトリ

Gemini-CLI を使ってレッスンごとにテストファイルを作成してもらい自学習を進める。（https://github.com/google-gemini/gemini-cli?tab=readme-ov-file）

## 実績

- [Lesson 1: 基本のセットアップ](./documents/lesson1-summary.md)
- [Lesson 2: フロントエンドとバックエンドの連携](./documents/lesson2-summary.md)
- [Lesson 3: データの送信と表示](./documents/lesson3-summary.md)
- [Lesson 4: データベースとの連携（一覧表示）](./documents/lesson4-summary.md)
- [Lesson 5: データの追加と削除](./documents/lesson5-summary.md)
- [TODO アプリ作成](./documents/todoApp.md)

## 学習用

- [angular: レンダリングフロー](./documents/angular/rendering.md)
- [angular: 主要ファイル](./documents/angular/files.md)
- [angular: デプロイ周り](./documents/angular/deploy.md)
- [SpringBoot: 基本構成](./documents/springboot/base.md)
- [SpringBoot: Controller の役割とリクエスト処理の流れ](./documents/springboot/request-flow.md)
- [SpringBoot: Service 層と Repository 層の役割分担](./documents/springboot/service.md)
- [SpringBoot: pom.xml の役割](./documents/springboot/pom.md)

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
