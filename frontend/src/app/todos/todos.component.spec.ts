import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { TodosComponent } from './todos.component';
import { TodoService, Todo } from '../services/todo.service';

/**
 * TodosComponentのテストスイート
 * Todo管理機能（CRUD操作）の動作を検証する
 */
describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let todoService: jasmine.SpyObj<TodoService>;

  // テスト用のモックTodoデータ
  // 完了済みと未完了のTodoを含む
  const mockTodos: Todo[] = [
    { id: 1, title: 'Test Todo 1', dueDate: '2024-01-01', completed: false },
    { id: 2, title: 'Test Todo 2', dueDate: '2024-01-02', completed: true },
  ];

  /**
   * 各テストケース実行前のセットアップ
   * TodoServiceのモックを作成し、コンポーネントを初期化する
   */
  beforeEach(async () => {
    // TodoServiceのモックを作成（各CRUDメソッドをスパイ）
    const todoServiceSpy = jasmine.createSpyObj('TodoService', [
      'getTodos', // Todo一覧取得
      'addTodo', // Todo追加
      'updateTodo', // Todo更新
      'deleteTodo', // Todo削除
    ]);

    // 各メソッドの戻り値を設定
    todoServiceSpy.getTodos.and.returnValue(of(mockTodos)); // モックデータを返す
    todoServiceSpy.addTodo.and.returnValue(of(mockTodos[0])); // 追加したTodoを返す
    todoServiceSpy.updateTodo.and.returnValue(of(mockTodos[0])); // 更新したTodoを返す
    todoServiceSpy.deleteTodo.and.returnValue(of(void 0)); // 削除成功（void）

    // テストモジュールを設定
    await TestBed.configureTestingModule({
      imports: [TodosComponent, FormsModule], // コンポーネントとフォームモジュールをインポート
      providers: [{ provide: TodoService, useValue: todoServiceSpy }], // モックサービスを提供
    }).compileComponents();

    // コンポーネントのインスタンスを作成
    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService) as jasmine.SpyObj<TodoService>;
    fixture.detectChanges(); // 変更検知を実行（ngOnInitが呼ばれる）
  });

  /**
   * 基本的なコンポーネント作成のテスト
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * コンポーネントの初期状態をテスト
   * ngOnInitが呼ばれる前の状態を確認する
   */
  it('should initialize with empty todo lists', () => {
    // 新しいコンポーネントインスタンスを作成（ngOnInitを呼ばない）
    const newComponent = new TodosComponent(todoService);

    // 初期状態では空の配列と空文字列であることを確認
    expect(newComponent.todos).toEqual([]);
    expect(newComponent.newTodoTitle).toBe('');
    expect(newComponent.newTodoDueDate).toBe('');
    expect(newComponent.editingTodo).toBeNull();
  });

  /**
   * ngOnInit実行時のTodo読み込み機能をテスト
   * TodoServiceからデータを取得し、コンポーネントに設定されることを確認
   */
  it('should load todos on init', () => {
    component.ngOnInit();

    // TodoServiceのgetTodosメソッドが呼ばれることを確認
    expect(todoService.getTodos).toHaveBeenCalled();
    // コンポーネントのtodosプロパティにモックデータが設定されることを確認
    expect(component.todos).toEqual(mockTodos);
  });

  /**
   * 新しいTodo追加機能をテスト
   * フォーム入力からTodoを作成し、サービスに送信することを確認
   */
  it('should add new todo', () => {
    // テスト用のデータを設定
    component.newTodoTitle = 'New Todo';
    component.newTodoDueDate = '2024-01-03';

    // addTodoメソッドを実行
    component.addTodo();

    // TodoServiceのaddTodoメソッドが正しい引数で呼ばれることを確認
    expect(todoService.addTodo).toHaveBeenCalledWith({
      title: 'New Todo',
      dueDate: '2024-01-03',
      completed: false, // 新規作成時は未完了
    });
    // フォームがリセットされることを確認
    expect(component.newTodoTitle).toBe('');
    expect(component.newTodoDueDate).toBe('');
  });

  /**
   * Todo編集モード開始機能をテスト
   * 編集対象のTodoをコピーしてeditingTodoに設定することを確認
   */
  it('should edit todo', () => {
    const todoToEdit = mockTodos[0];

    // editTodoメソッドを実行
    component.editTodo(todoToEdit);

    // editingTodoが正しく設定されることを確認（参照が異なるオブジェクト）
    expect(component.editingTodo).toEqual({ ...todoToEdit });
  });

  /**
   * Todo更新機能をテスト
   * 編集中のTodoをサービスに送信し、編集モードを終了することを確認
   */
  it('should update todo', () => {
    // 編集モードの状態を設定
    component.editingTodo = { ...mockTodos[0] };
    component.editingTodo.title = 'Updated Todo';

    // updateTodoメソッドを実行
    component.updateTodo();

    // TodoServiceのupdateTodoメソッドが正しい引数で呼ばれることを確認
    expect(todoService.updateTodo).toHaveBeenCalledWith({
      id: mockTodos[0].id,
      title: 'Updated Todo',
      dueDate: mockTodos[0].dueDate,
      completed: mockTodos[0].completed,
    });
    // 編集モードが終了することを確認
    expect(component.editingTodo).toBeNull();
  });

  /**
   * Todo削除機能をテスト
   * 指定されたIDのTodoを削除することを確認
   */
  it('should delete todo', () => {
    const todoId = 1;

    // deleteTodoメソッドを実行
    component.deleteTodo(todoId);

    // TodoServiceのdeleteTodoメソッドが正しいIDで呼ばれることを確認
    expect(todoService.deleteTodo).toHaveBeenCalledWith(todoId);
  });

  /**
   * エッジケース：IDがundefinedの場合の削除処理をテスト
   * 不正なIDの場合は削除処理が実行されないことを確認
   */
  it('should not delete todo when id is undefined', () => {
    // undefinedのIDでdeleteTodoメソッドを実行
    component.deleteTodo(undefined);

    // TodoServiceのdeleteTodoメソッドが呼ばれないことを確認
    expect(todoService.deleteTodo).not.toHaveBeenCalled();
  });

  /**
   * Todo完了状態切り替え機能をテスト
   * チェックボックスの変更時にTodoの完了状態を更新することを確認
   */
  it('should toggle todo completed status', () => {
    const todoToToggle = { ...mockTodos[0] };

    // toggleCompletedメソッドを実行
    component.toggleCompleted(todoToToggle);

    // TodoServiceのupdateTodoメソッドが呼ばれることを確認
    expect(todoService.updateTodo).toHaveBeenCalledWith(todoToToggle);
  });
});
