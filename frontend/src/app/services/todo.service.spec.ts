import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TodoService, Todo } from './services/todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService],
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve todos from the API via GET', () => {
    const mockTodos: Todo[] = [
      { id: 1, title: 'Test Todo 1', dueDate: '2025-07-01', completed: false },
      { id: 2, title: 'Test Todo 2', dueDate: '2025-07-02', completed: true },
    ];

    service.getTodos().subscribe((todos) => {
      expect(todos.length).toBe(2);
      expect(todos).toEqual(mockTodos);
    });

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush(mockTodos);
  });

  it('should add a todo via POST', () => {
    const newTodo: Todo = {
      title: 'New Todo',
      dueDate: '2025-07-03',
      completed: false,
    };
    const savedTodo: Todo = { ...newTodo, id: 3 };

    service.addTodo(newTodo).subscribe((todo) => {
      expect(todo).toEqual(savedTodo);
    });

    const req = httpMock.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTodo);
    req.flush(savedTodo);
  });

  it('should update a todo via PUT', () => {
    const updatedTodo: Todo = {
      id: 1,
      title: 'Updated Todo',
      dueDate: '2025-07-04',
      completed: true,
    };

    service.updateTodo(updatedTodo).subscribe((todo) => {
      expect(todo).toEqual(updatedTodo);
    });

    const req = httpMock.expectOne(`/api/todos/${updatedTodo.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTodo);
    req.flush(updatedTodo);
  });

  it('should delete a todo via DELETE', () => {
    const todoId = 1;

    service.deleteTodo(todoId).subscribe(() => {
      expect().nothing();
    });

    const req = httpMock.expectOne(`/api/todos/${todoId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
