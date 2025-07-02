# Controller の役割とリクエスト処理の流れ

フロントエンド（Angular）から送られてきた HTTP リクエストを、Spring Boot アプリケーションがどのように受け取り、処理し、応答を返すかという、バックエンドアプリケーションの最も中心的な動作。

✦ TODO アプリのメインのコントローラーである TodoController.java の中身を見て、具体的な処理の流れを追っていきましょう。

## Controller の役割とリクエスト処理の流れ

Controller は、外部からの HTTP リクエストを受け取るための「玄関」の役割を果たします。どの URL（エンドポイント）に、どの HTTP メソッド（GET, POST など）でアクセスされたら、どの処理（Java のメソッド）を実行するかを定義します。

### 重要なアノテーション

TodoController.java で使われているアノテーションが、この流れを理解する鍵です。

| アノテーション                  | 役割                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@RestController`               | このクラスが REST API のコントローラーであることを示します。これは `@Controller` と `@ResponseBody` を組み合わせたものです。<br>・`@Controller`: このクラスが SpringMVC のコントローラーであることを示します。<br>・`@ResponseBody`: このクラスのメソッドの戻り値（Java オブジェクト）が、自動的に JSON 形式に変換されて HTTP レスポンスのボディとして返されることを示します。Angular などのフロントエンドは、この JSON を受け取って処理します。 |
| `@RequestMapping("/api/todos")` | このクラス内のすべてのメソッドに共通する URL のプレフィックス（接頭辞）を定義します。つまり、このクラスが処理するリクエストはすべて `/api/todos` から始まります。                                                                                                                                                                                                                                                                                |
| `@GetMapping`                   | HTTP GET リクエストを処理するメソッドに付けます。`@RequestMapping(method = RequestMethod.GET)` の短縮形です。<br>例: `GET /api/todos` へのリクエストは `getAllTodos()` メソッドが処理します。                                                                                                                                                                                                                                                    |
| `@PostMapping`                  | HTTP POST リクエストを処理するメソッドに付けます。<br>例: `POST /api/todos` へのリクエストは `createTodo()` メソッドが処理します。                                                                                                                                                                                                                                                                                                               |
| `@PutMapping("/{id}")`          | HTTP PUT リクエストを処理するメソッドに付けます。`{id}` の部分はパス変数と呼ばれ、URL の一部を動的な値として受け取ることができます。<br>例: `PUT /api/todos/1` へのリクエストは `updateTodo()` メソッドが処理し、id には 1 が渡されます。                                                                                                                                                                                                        |
| `@DeleteMapping("/{id}")`       | HTTP DELETE リクエストを処理するメソッドに付けます。<br>例: `DELETE /api/todos/1` へのリクエストは`deleteTodo()` メソッドが処理します。                                                                                                                                                                                                                                                                                                          |
| `@RequestBody`                  | HTTP リクエストのボディに含まれる JSON データを、指定した Java オブジェクト（この例では Todo クラスのインスタンス）に自動的にマッピング（変換）します。フロントエンドから送られてきた JSON データを Java で扱うために不可欠です。                                                                                                                                                                                                                |
| `@PathVariable`                 | URL のパス変数（{id}など）を、メソッドの引数として受け取るために使います。                                                                                                                                                                                                                                                                                                                                                                       |
| `@Autowired`                    | DI (Dependency Injection / 依存性の注入) を行うためのアノテーションです。Spring が管理している別の Bean（この場合は TodoRepository）を、このクラスに自動的に注入（インスタンスを代入）してくれます。これにより、Controller は自分で Repository をインスタンス化することなく、その機能を利用できます。                                                                                                                                            |

```java
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoRepository todoRepository;

    // すべてのTODOを取得するGET API
    @GetMapping
    public List<Todo> getAllTodos() {
        return this.todoRepository.findAll();
    }

    // 新しいTODOを作成するPOST API
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        Todo saved = todoRepository.save(todo);
        return ResponseEntity.ok(saved);
    }

    // 指定されたIDのTODOを更新するPUT API
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        Optional<Todo> optionalTodo = todoRepository.findById(id);
        if (optionalTodo.isPresent()) {
            Todo existingTodo = optionalTodo.get();
            existingTodo.setTitle(todo.getTitle());
            existingTodo.setDueDate(todo.getDueDate());
            existingTodo.setCompleted(todo.isCompleted());
            Todo updated = todoRepository.save(existingTodo);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 指定されたIDのTODOを削除するDELETE API
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
```

### リクエスト処理の具体例 (TODO 作成)

Angular のフォームで新しい TODO を入力して「追加」ボタンを押した時の、バックエンドでの処理の流れを見てみましょ
う。

1.  リクエスト受信:

    - Angular は、入力された TODO の情報（タイトルなど）を JSON 形式のデータにし、`POST /api/todos` というリクエストをバックエンドに送信します。

2.  ディスパッチャサーブレット:

    - Spring Boot の内部では、ディスパッチャサーブレットという司令塔がすべてのリクエストを最初に受け取ります。

3.  ハンドラーマッピング:

    - ディスパッチャサーブレットは、リクエストの情報（POST, /api/todos）を見て、どのコントローラーのどのメソッドがこのリクエストを処理すべきかを判断します。
    - この場合、`@RequestMapping("/api/todos")` を持つ TodoController クラスの、`@PostMapping` が付いた `createTodo(@RequestBody Todo todo)` メソッドが担当だと特定されます。

4.  メソッド実行:

    - Spring は createTodo メソッドを呼び出します。
    - その際、`@RequestBody` アノテーションの力で、リクエストボディの JSON データが自動的に Todo オブジェクトに変換され、引数 todo に渡されます。
    - メソッド内部では、`@Autowired` で注入された `todoRepository` の `save()`メソッドを呼び出して、受け取った Todo オブジェクトをデータベースに保存します。

5.  レスポンス生成:

    - `save()` メソッドは、データベースに保存された後の（ID が採番された）Todo オブジェクトを返します。
    - `ResponseEntity.ok(saved)` は、HTTP ステータスコード `200 OK` と、レスポンスボディとして saved オブジェクトを持つ ResponseEntity を作成します。
    - `@RestController`（内部的には `@ResponseBody`）の力で、戻り値の Todo オブジェクトが JSON 形式に変換されます。

6.  レスポンス送信:

    - ディスパッチャサーブレットは、生成された HTTP レスポンス（ステータスコード `200 OK` と、ボディに TODO の JSON データ）をフロントエンド（Angular）に返します。

7.  フロントエンドでの処理:
    - Angular はレスポンスを受け取り、TODO リストを再読み込みして画面を更新します。

## まとめ

- `@RestController` を付けたクラスが API の窓口となる。
- `@RequestMapping` と `@GetMapping` などのマッピングアノテーションが、URL とメソッドを紐付ける。
- `@RequestBody` と `@PathVariable` が、リクエストからデータを取り出す。
- `@Autowired` が、クラス間の連携（DI）を実現する。
- メソッドの戻り値が自動的に JSON に変換されて返される。

この一連の流れを理解することで、API の追加や変更をどのように行えばよいかが明確になります。次に学ぶべきは、この Controller から呼び出されている Repository や、その間の Service 層の役割についてです。
