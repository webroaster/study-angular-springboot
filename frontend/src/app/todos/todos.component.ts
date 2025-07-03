import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService, Todo } from '../services/todo.service';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css'],
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle: string = '';
  newTodoDueDate: string = ''; // YYYY-MM-DD 形式

  editingTodo: Todo | null = null; // 編集中のTODO

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    // TodoServiceを使ってすべてのTODOを取得し、this.todosにセット
    this.todoService.getTodos().subscribe((todos) => {
      this.todos = todos;
    });
  }

  addTodo(): void {
    // newTodoTitleとnewTodoDueDateを使って新しいTODOを作成し、TodoServiceで追加
    const newTodo: Todo = {
      title: this.newTodoTitle,
      dueDate: this.newTodoDueDate ?? null,
      completed: false,
    };
    this.todoService.addTodo(newTodo).subscribe(() => {
      this.newTodoTitle = '';
      this.newTodoDueDate = '';
      this.loadTodos();
    });
  }

  editTodo(todo: Todo): void {
    // スプレッド構文で新しいオブジェクトを作成し、編集中のTODOとしてセットする
    this.editingTodo = { ...todo };
  }

  updateTodo(): void {
    // editingTodoを使ってTODOを更新し、TodoServiceで更新
    const updateTodo: Todo = {
      id: this.editingTodo?.id,
      title: this.editingTodo?.title ?? '',
      dueDate: this.editingTodo?.dueDate ?? '',
      completed: this.editingTodo?.completed ?? false,
    };
    this.todoService.updateTodo(updateTodo).subscribe(() => {
      this.editingTodo = null;
      this.loadTodos();
    });
  }

  deleteTodo(id: number | undefined): void {
    // 指定されたIDのTODOを削除し、TodoServiceで削除
    if (id) {
      this.todoService.deleteTodo(id).subscribe(() => {
        this.loadTodos();
      });
    }
  }

  toggleCompleted(todo: Todo): void {
    // TODOの完了状態を切り替え、TodoServiceで更新
    this.todoService.updateTodo(todo).subscribe(() => {
      this.loadTodos();
    });
  }
}
