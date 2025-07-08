# SpringBoot テスト

## Jest と SpringBoot テストの考え方の違い

今まで Node.js のテストは `jest` で作成してきたので、SpringBoot での違いについて比較しながら理解します。

| Jest の要素                      | SpringBoot テストでの相当機能        | 説明                                                                                     |
| :------------------------------- | :----------------------------------- | :--------------------------------------------------------------------------------------- |
| `describe('...', () => { ... })` | `@Nested` クラス or テストクラス自体 | テストのグループ化。Java ではクラスがその役割を担います。                                |
| `it('...', () => { ... })`       | `@Test` メソッド                     | 個々のテストケースを定義します。                                                         |
| `expect(result).toBe(5)`         | `assertThat(result).isEqualTo(5)`    | アサーション（結果の検証）。SpringBoot では `AssertJ` というライブラリがよく使われます。 |
| `jest.mock('./api')`             | `@MockBean` or `Mockito.mock()`      | モックの作成。依存するコンポーネントを偽のオブジェクトに置き換えます。                   |
| `beforeEach(() => { ... })`      | `@BeforeEach`                        | 各テストの前に実行されるセットアップ処理です。                                           |
| `test runner (jest)`             | `Maven` or `Gradle`                  | テストを実行するためのビルドツール。`mvn test` コマンドで実行します。                    |

## SpringBoot テストの技術的な要素

SpringBoot のテストは、いくつかの主要なライブラリと、テストを簡単にするための便利な「アノテーション」で構成されています。

### 1. 主要ライブラリ

SpringBoot プロジェクトを初期化すると、`spring-boot-starter-test` という依存関係が自動的に `pom.xml` に追加されます。これには、以下の主要なテストライブラリが含まれています。

- **JUnit 5**: Java で最も標準的なテストフレームワークです。`@Test` などのアノテーションを提供し、テストの実行基盤となります。
- **Mockito**: オブジェクトをモック化するためのライブラリです。これを使うことで、テスト対象のクラスが依存している他のクラス（例: Service が依存する Repository）の動作を偽装し、テストを独立させることができます。
- **AssertJ**: 流れるような（fluent な）インターフェースを持つアサーションライブラリです。
  `assertThat(user.getName()).isEqualTo("Taro")`のように、直感的で読みやすい検証コードを書くことができます。
- **Spring Test & Spring Boot Test**: Spring の DI コンテナや各種機能をテストで利用するためのサポートを提供します。

### 2. テストの「スライス」という考え方

Jest ではテスト対象のファイルだけをインポートしてテストしますが、SpringBoot は巨大なアプリケーションコンテキスト（DI コンテナ）を持っています。毎回すべてのコンポーネントを読み込んでテストすると、非常に時間がかかります。

そこで SpringBoot では、テストスライスという考え方を採用しています。これは、アプリケーションの一部（スライス）だけを読み込んでテストを高速化・軽量化する仕組みです。

代表的なテストスライス用のアノテーションには以下のようなものがあります。

- **`@WebMvcTest`**: Controller 層のテストに特化。`@Controller`, `@RestController` などの Web 関連の Bean だけを読み込みます。
  Service や Repository は読み込まないので、`@MockBean` を使ってモック化する必要があります。
- **`@DataJpaTest`**: JPA（データベースアクセス）層のテストに特化。`@Repository` などの JPA 関連の Bean だけを読み込みます。インメモリデータベース(H2 など)を使ってテストを実行するため、実際の DB を汚すことがありません。
- **`@SpringBootTest`**: これはスライスではなく、アプリケーション全体を読み込む統合テスト用のアノテーションです。すべての Bean が読み込まれるため、テストは重くなりますが、本番に近い環境でコンポーネント間の連携をテストできます。

## テストの進め方について

Java、特に Spring Boot アプリケーションにおけるテストの進め方について、基本的な考え方をいくつか紹介します。

### 1. テストの階層を意識する

一般的に、テストは以下の 3 つの階層に分けて考えます。

- **① コントローラ層 (Controller Layer) のテスト:**

  - **目的**: HTTP リクエストを受け取り、期待通りのレスポンス（ステータスコード、JSON など）を返すかを確認します。
  - **方法**: `TodoControllerTest.java` で使われている `@WebMvcTest` を利用します。これは、Web 層（Controller）だけをスキャンしてテスト環境を構築する便利なアノテーションです。Service 層はモック（`@MockBean`）にして、Controller のロジックだけに集中します。
  - **確認すること:**
    - 正しいエンドポイント（URL）でリクエストを受け付けているか？
    - リクエストのパラメータやボディを正しく受け取れているか？
    - Service の正しいメソッドを呼び出しているか？
    - Service の返り値に基づいて、適切な HTTP ステータスコード（`200 OK`, `404 Not Found` など）を返しているか？
    - 正しい JSON を返しているか？

- **② サービス層 (Service Layer) のテスト:**

  - **目的**: ビジネスロジックが正しく動作するかを確認します。
  - **方法**: これは純粋な Java クラスのテスト（ユニットテスト）に近いです。`@SpringBootTest` を使うこともできますが、より軽量なテストが可能です。Mapper（Repository）層はモックにして、Service のロジックに集中します。
  - **確認すること:**
    - 条件分岐（if 文など）は正しく機能しているか？
    - 複雑な計算やデータ加工は正しいか？
    - Mapper のメソッドを期待通りに呼び出しているか？
    - 例外処理は適切か？

- **③ マッパー層 (Mapper/Repository Layer) のテスト:**
  - **目的**: データベースとのやりとり（SQL）が正しく行われるかを確認します。
  - **方法**: `@MybatisTest` のようなアノテーションを使い、実際のデータベース（または H2 のようなインメモリデータベース）に接続してテストします。これは「インテグレーションテスト」の一種です。
  - **確認すること:**
    - SQL 文に間違いはないか？
    - 期待通りのデータが取得・保存・更新・削除されるか？

## 具体的なテストの実装例

それでは、TodoController のテストを例に、具体的なコードを見てみましょう。

> **シナリオ**: `GET /api/todos` にリクエストを送ると、TodoService が返す Todo リスト（JSON 形式）が HTTP ステータス 200 で返却されることをテストする。

1. **テスト対象の Controller と Service (例)**

   ```java
   // src/main/java/com/example/demo/TodoController.java
   @RestController
   @RequestMapping("/api/todos")
   public class TodoController {

    private final TodoService todoService;

    @Autowired
    public TodoController(TodoService todoService) {
      this.todoService = todoService;
    }

    @GetMapping
    public List<Todo> getTodos() {
      return todoService.findAll();
    }
   }

   // src/main/java/com/example/demo/TodoService.java
   @Service
   public class TodoService {
    // ...
    public List<Todo> findAll() {
      // 本来は DB から取得する
      return List.of(new Todo(1L, "TODO_1", false));
    }
   }
   ```

2. **Controller のテストコード**

このテストでは、`TodoService` の実際の動作はテストしません。`TodoController` が `TodoService` を正しく呼び出し、その結果を適切に HTTP レスポンスとして返せるかだけを検証します。そのため、TodoService はモック化します。

```java
// src/test/java/com/example/demo/TodoControllerTest.java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// 1. @WebMvcTestアノテーションでController層のテストであることを示す
//    TodoControllerのみをDIコンテナにロードする
@WebMvcTest(TodoController.class)
class TodoControllerTest {

  // 2. MockMvc: HTTPリクエストをシミュレートするためのオブジェクト
  @Autowired
  private MockMvc mockMvc;

  // 3. @MockBean: DIコンテナ内のTodoServiceをモックに置き換える
  //    Jestの jest.mock() に相当
  @MockBean
  private TodoService todoService;

  // 4. @Test: これが1つのテストケース
  @Test
  void getTodos_shouldReturnTodoList() throws Exception {
    // 5. Arrange (準備): モックの動作を定義
    // todoService.findAll()が呼ばれたら、固定のリストを返すように設定
    Todo todo = new Todo(1L, "TEST_TODO", false);
    when(todoService.findAll()).thenReturn(List.of(todo));

    // 6. Act & Assert (実行と検証)
    mockMvc.perform(get("/api/todos")) // GET /api/todos にリクエストを送信
      .andExpect(status().isOk()) // HTTPステータスが200であることを期待
      .andExpect(jsonPath("$[0].id").value(1)) // JSONレスポンスの検証
      .andExpect(jsonPath("$[0].title").value("TEST_TODO"));
  }
}
```

**解説:**

1. `@WebMvcTest(TodoController.class)`: Web 層のテストスライスを有効にし、TodoController だけをテスト対象として読み込みます。
2. `@Autowired private MockMvc mockMvc;`: Spring Test が提供する、MVC のテスト用クライアントです。これを使って擬似的な HTTP リクエストを送信します。
3. `@MockBean private TodoService todoService;`: TodoController が依存している TodoService を、Mockito が作成したモックオブジェクトに差し替えます。
   これにより、TodoService の内部実装に関係なく TodoController のテストができます。
4. `@Test`: JUnit 5 のアノテーションで、このメソッドがテストケースであることを示します。
5. `when(todoService.findAll()).thenReturn(...)`:
   Mockito の記法です。「もし `todoService.findAll()` が呼ばれたら、このリストを返しなさい」というモックの振る舞いを定義しています。
6. `mockMvc.perform(...)`:
   mockMvc を使ってリクエストを実行し、`.andExpect(...)` で結果を検証します。`jsonPath` を使うと、JSON の特定フィールドの値を簡単に検証できます。

まとめと次のステップ

- 基本: `pom.xml` の `spring-boot-starter-test` がテストの土台。
- フレームワーク: JUnit 5 (`@Test`) + Mockito (`@MockBean`) + AssertJ (`assertThat`) が三種の神器。
- 考え方: テストスライス (`@WebMvcTest`, `@DataJpaTest`) を使って、テストを軽量に保つのが基本。
- Controller テスト: `@WebMvcTest` と `MockMvc` を使い、Service 層は `@MockBean` でモック化する。
- Service テスト: Service クラスを `new` し、依存する Repository を `@Mock`（Mockito のアノテーション）でモック化してテストする。（これは DI コンテナを使わない、より Jest に近いテストです）
- Repository テスト: `@DataJpaTest` を使い、インメモリ DB で実際の SQL 発行をテストする。
