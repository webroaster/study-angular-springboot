# Lesson 1: 基本のセットアップ まとめ

このレッスンでは、SpringBoot（バックエンド）と Angular（フロントエンド）それぞれのプロジェクトで、最も基本的な「Hello, World!」を実装し、テストを実行して動作を確認しました。これにより、各フレームワークにおける最小単位のアプリケーション構造と、テスト駆動開発の第一歩を学びました。

## Backend (SpringBoot)

### 学習目標:

「/api/hello」という URL にアクセスすると、「Hello, SpringBoot!」という文字列を返す API を作成する。

キーポイント:

- `@RestController`: このクラスが Web リクエストを処理するコントローラーであることを示します。戻り値が直接レスポンスボディになることを意味します。
- `@GetMapping("/api/hello")`: HTTP の GET リクエストを、指定されたパス (/api/hello)とメソッド（今回は hello()）にマッピングします。
- 単体テスト (`@WebMvcTest`):
  - SpringBoot のテスト機能の一部で、Web 層（コントローラー）のみを対象としたテストを軽量に実行できます。
  - `MockMvc`:
  - 実際のサーバーを起動することなく、HTTP リクエストをシミュレートしてコントローラーの動作をテストするためのクラスです。
    - perform(get(...)): GET リクエストをシミュレートします。
    - andExpect(status().isOk()): HTTP ステータスコードが 200 (OK) であることを検証します。
    - andExpect(content().string(...)): レスポンスボディの文字列が期待通りであることを検証します。

関連ファイル:

- backend/src/main/java/com/example/demo/Lesson1Controller.java （実装したコード）
- backend/src/test/java/com/example/demo/Lesson1ControllerTest.java （実行したテストコード）

### 実行したコマンド:

```sh
# backend ディレクトリで実行
./mvnw test
```

### 結果

```sh
[INFO] Scanning for projects...
[INFO]
[INFO] --------------------------< com.example:demo >--------------------------
[INFO] Building demo 0.0.1-SNAPSHOT
[INFO]   from pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ demo ---
[INFO] Copying 1 resource from src/main/resources to target/classes
[INFO] Copying 0 resource from src/main/resources to target/classes
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ demo ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ demo ---
[INFO] skip non existing resourceDirectory /Users/akinishiguchi/Downloads/MOSA/stydy-angular-springboot/backend/src/test/resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ demo ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ demo ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.demo.DemoApplicationTests
10:10:04.434 [main] INFO org.springframework.test.context.support.AnnotationConfigContextLoaderUtils -- Could not detect default configuration classes for test class [com.example.demo.DemoApplicationTests]: DemoApplicationTests does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
10:10:04.489 [main] INFO org.springframework.boot.test.context.SpringBootTestContextBootstrapper -- Found @SpringBootConfiguration com.example.demo.DemoApplication for test class com.example.demo.DemoApplicationTests
10:10:04.566 [main] INFO org.springframework.boot.devtools.restart.RestartApplicationListener -- Restart disabled due to context in which it is running

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.5.3)

2025-07-01T10:10:04.715+09:00  INFO 88415 --- [demo] [           main] com.example.demo.DemoApplicationTests    : Starting DemoApplicationTests using Java 17.0.6 with PID 88415 (started by akinishiguchi in /Users/akinishiguchi/Downloads/MOSA/stydy-angular-springboot/backend)
2025-07-01T10:10:04.716+09:00  INFO 88415 --- [demo] [           main] com.example.demo.DemoApplicationTests    : No active profile set, falling back to 1 default profile: "default"
2025-07-01T10:10:05.230+09:00  INFO 88415 --- [demo] [           main] com.example.demo.DemoApplicationTests    : Started DemoApplicationTests in 0.67 seconds (process running for 1.111)
OpenJDK 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.250 s -- in com.example.demo.DemoApplicationTests
[INFO] Running com.example.demo.Lesson1ControllerTest
2025-07-01T10:10:05.621+09:00  INFO 88415 --- [demo] [           main] t.c.s.AnnotationConfigContextLoaderUtils : Could not detect default configuration classes for test class [com.example.demo.Lesson1ControllerTest]: Lesson1ControllerTest does not declare any static, non-private, non-final, nested classes annotated with @Configuration.
2025-07-01T10:10:05.630+09:00  INFO 88415 --- [demo] [           main] .b.t.c.SpringBootTestContextBootstrapper : Found @SpringBootConfiguration com.example.demo.DemoApplication for test class com.example.demo.Lesson1ControllerTest
2025-07-01T10:10:05.633+09:00  INFO 88415 --- [demo] [           main] o.s.b.d.r.RestartApplicationListener     : Restart disabled due to context in which it is running

  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/

 :: Spring Boot ::                (v3.5.3)

2025-07-01T10:10:05.646+09:00  INFO 88415 --- [demo] [           main] com.example.demo.Lesson1ControllerTest   : Starting Lesson1ControllerTest using Java 17.0.6 with PID 88415 (started by akinishiguchi in /Users/akinishiguchi/Downloads/MOSA/stydy-angular-springboot/backend)
2025-07-01T10:10:05.646+09:00  INFO 88415 --- [demo] [           main] com.example.demo.Lesson1ControllerTest   : No active profile set, falling back to 1 default profile: "default"
2025-07-01T10:10:05.730+09:00  INFO 88415 --- [demo] [           main] o.s.b.t.m.w.SpringBootMockServletContext : Initializing Spring TestDispatcherServlet ''
2025-07-01T10:10:05.730+09:00  INFO 88415 --- [demo] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Initializing Servlet ''
2025-07-01T10:10:05.731+09:00  INFO 88415 --- [demo] [           main] o.s.t.web.servlet.TestDispatcherServlet  : Completed initialization in 0 ms
2025-07-01T10:10:05.736+09:00  INFO 88415 --- [demo] [           main] com.example.demo.Lesson1ControllerTest   : Started Lesson1ControllerTest in 0.103 seconds (process running for 1.617)
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.161 s -- in com.example.demo.Lesson1ControllerTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  2.283 s
[INFO] Finished at: 2025-07-01T10:10:05+09:00
[INFO] ------------------------------------------------------------------------
```

---

## Frontend (Angular)

### 学習目標:

画面に「Hello, Angular!」というメッセージを静的に表示する。

キーポイント:

- Component: Angular アプリケーションを構成する基本的な UI の部品です。TypeScript のクラス (.ts)、HTML テンプレート(.html)、CSS スタイル (.css) から成ります。
- `@Component` デコレータ: TypeScript クラスを Angular コンポーネントとして定義するためのものです。セレクタ（HTML タグ名）、テンプレートの場所などを指定します。
- プロパティバインディング (`{{ title }}`): コンポーネントのプロパティ（今回は title）の値を HTML テンプレート内に表示させるための構文です。「データバインディング」の最も基本的な形式です。
- 単体テスト (`describe`, `it`, `expect`): Jasmine というテストフレームワークの構文です。
- TestBed:
  - Angular のテスト用モジュールを構成し、コンポーネントをテスト環境で作成・設定するための中心的なユーティリティです。
  - fixture: テスト対象のコンポーネントのインスタンスとその DOM 要素をラップしたものです。
  - fixture.detectChanges():
    - コンポーネントの状態をビューに反映させる（データバインディングを更新する）ために呼び出します。

関連ファイル:

- frontend/src/app/app.component.ts （実装したコード）
- frontend/src/app/app.component.html （ビューテンプレート）
- frontend/src/app/app.component.spec.ts （実行したテストコード）

### 実行したコマンド:

```sh
# frontend ディレクトリで実行
npm install # 初回のみ
npm run test
```

### 結果

```sh
❯ npm run test

> frontend@0.0.0 test
> ng test

✔ Browser application bundle generation complete.
⠋ Generating browser application bundles...01 07 2025 10:24:19.173:WARN [karma]: No captured browser, open http://localhost:9876/
01 07 2025 10:24:19.188:INFO [karma-server]: Karma v6.4.4 server started at http://localhost:9876/
01 07 2025 10:24:19.189:INFO [launcher]: Launching browsers Chrome with concurrency unlimited
⠙ Generating browser application bundles (phase: building)...01 07 2025 10:24:19.191:INFO [launcher]: Starting browser Chrome
✔ Browser application bundle generation complete.
01 07 2025 10:24:20.613:INFO [Chrome 138.0.0.0 (Mac OS 10.15.7)]: Connected on socket abO_URRvRhUogetBAAAB with id 18220477
Chrome 138.0.0.0 (Mac OS 10.15.7): Executed 3 of 3 SUCCESS (0.031 secs / 0.025 secs)
TOTAL: 3 SUCCESS
✔ Browser application bundle generation complete.
✔ Browser application bundle generation complete.
✔ Browser application bundle generation complete.
```
