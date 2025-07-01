# Angular のレンダリングフロー

Angular アプリケーションは、以下のステップで起動し、画面を描画します。

1.  `index.html` の読み込み:

    - ブラウザは最初に frontend/src/index.html を読み込みます。このファイルが Web アプリケーションの土台となります。
    - <body> タグの中に <app-root></app-root> という見慣れないタグがあります。これがAngularアプリケーションが挿入される場所（ホスト要素）になります。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Frontend</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
```

2.  `main.ts` による起動:

    - 次に frontend/src/main.ts が実行されます。このファイルが Angular アプリケーションのエントリーポイント（起動ファイル）です。
    - `bootstrapApplication(AppComponent, appConfig)` というコードが、`AppComponent` をアプリケーションのルートコンポーネント（一番親のコンポーネント）として起動します。
    - appConfig には、アプリケーション全体で使われる設定（ルーティングや HTTP クライアントなど）が含まれています。

```ts
import { bootstrapApplication } from "@angular/platform-browser"
import { appConfig } from "./app/app.config"
import { AppComponent } from "./app/app.component"

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err))
```

3.  `AppComponent` の表示:

    - Angular は AppComponent (frontend/src/app/app.component.ts) をインスタンス化します。
    - `@Component` デコレータに注目してください。
      - `selector: 'app-root'`: このコンポーネントがどの HTML タグに対応するかを定義します。index.html の <app-root> と一致しますね。
      - `templateUrl: './app.component.html`': このコンポーネントが表示する HTML テンプレートの場所。
      - `styleUrls: ['./app.component.css']`: このコンポーネントに適用される CSS の場所。
    - Angular は app.component.html の内容をコンパイルし、index.html の <app-root> タグの中にレンダリングします。

```ts
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  ...
}
```

4.  データバインディングと変更検知:
    - AppComponent のクラスには `todos` や `newTodoTitle` といったプロパティ（データ）があります。
    - app.component.html の中では、`\*ngFor` や `{{ }}` といった構文を使って、これらのデータを HTML に結びつけます（データバインディング）。
    - ユーザーがボタンをクリックしたり、テキストを入力したりすると、イベントが発生します。
    - Angular は Zone.js というライブラリを使ってこれらのイベントを検知し、データが変更された可能性があるコンポーネントを効率的にチェックします（変更検知）。
    - データに変更があれば、Angular は DOM の該当部分だけを更新し、画面を再レンダリングします。

```html
<div class="container">
  <h1>Todo List</h1>

  <!-- Add Todo Form -->
  <div>
    <input [(ngModel)]="newTodoTitle" placeholder="Todo Title" class="todoInput" />
    <input type="date" [(ngModel)]="newTodoDueDate" />
    <button (click)="addTodo()">Add Todo</button>
  </div>

  <hr />

  <!-- Todo List -->
  <ul *ngIf="todos.length > 0">
    <li *ngFor="let todo of todos">
      <input type="checkbox" [(ngModel)]="todo.completed" (change)="toggleCompleted(todo)" />
      <span [class.completed]="todo.completed">{{ todo.title }}</span>
      <span class="due-date"> (Due: {{ todo.dueDate }})</span>
      <button (click)="editTodo(todo)">Edit</button>
      <button (click)="deleteTodo(todo.id)">Delete</button>
    </li>
  </ul>
  <p *ngIf="todos.length === 0">No todos yet. Add one!</p>

  <hr />

  <!-- Edit Todo Form -->
  <div *ngIf="editingTodo">
    <h2>Edit Todo</h2>
    <input [(ngModel)]="editingTodo.title" />
    <input type="date" [(ngModel)]="editingTodo.dueDate" />
    <input type="checkbox" [(ngModel)]="editingTodo.completed" />
    <button (click)="updateTodo()">Save Changes</button>
    <button (click)="editingTodo = null">Cancel</button>
  </div>
</div>
```

React との比較

| 機能 | Angular | React |
| :-- | :-- | :-- |
| エントリーポイント | main.ts で bootstrapApplication を呼び出す | index.js で ReactDOM.createRoot().render() を呼び出す |
| ルート要素 | index.html の `<app-root>` | index.html の `<div id="root">` |
| コンポーネント | `@Component` デコレータでメタデータ（HTML,CSS）を定義した TypeScript クラス | JSX を返す JavaScript 関数またはクラス |
| テンプレート | HTML ファイル (.html) と TypeScript クラス (.ts) が分離している | JSX を使い、ロジックとビューが同じファイルに混在することが多い |
| データ管理 | コンポーネントのプロパティとして管理。双方向データバインディング(`[(ngModel)]`) も可能 | useState フックなどで状態 (state)を管理。単方向のデータフローが基本 |
| 変更検知 | Zone.js による自動的な変更検知 | useState のセッター関数 (setXXX)が呼ばれると再レンダリングがトリガーされる |
| エコシステム | ルーティング、HTTP クライアント、フォーム管理などが公式パッケージとして提供されるフルスタックなフレームワーク | ルーティング (react-router-dom) や状態管理 (Redux,Zustand) などはサードパーティのライブラリを組み合わせて使うことが多い |

まとめ

- Angular は、HTML、CSS、TypeScript を明確に分離し、`@Component` デコレータでそれらを関連付けます。Zone.js による自動的な変更検知が特徴で、大規模なアプリケーション開発に必要な機能が最初から揃っている「全部入り」のフレームワークです。
- React は、JSX を使ってロジックとビューを一体化させることが多く、状態の更新を明示的に行うことで UI を更新します。より柔軟でライブラリ的な側面が強く、必要な機能を自分で選択して組み合わせていくスタイルです。

TODO アプリでは、`index.html -> main.ts -> AppComponent` という流れでアプリケーションが起動し、AppComponent が TODO リストの表示や操作の起点となっている、と理解していただければと思います。
