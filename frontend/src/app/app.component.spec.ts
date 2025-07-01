import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TodoService, Todo } from './todo.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let todoService: TodoService;

  const mockTodos: Todo[] = [
    { id: 1, title: 'Mock Todo 1', dueDate: '2025-07-01', completed: false },
    { id: 2, title: 'Mock Todo 2', dueDate: '2025-07-02', completed: true }
  ];

  const mockTodoService = {
    getTodos: () => of(mockTodos),
    addTodo: (todo: Todo) => of({ ...todo, id: 3 } as Todo),
    updateTodo: (todo: Todo) => of(todo),
    deleteTodo: (id: number) => of(void 0)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: TodoService, useValue: mockTodoService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load todos on init', () => {
    spyOn(todoService, 'getTodos').and.callThrough();
    fixture.detectChanges(); // ngOnInitをトリガー
    expect(todoService.getTodos).toHaveBeenCalled();
    expect(component.todos).toEqual(mockTodos);
  });

  it('should add a todo', () => {
    spyOn(todoService, 'addTodo').and.callThrough();
    spyOn(component, 'loadTodos');

    component.newTodoTitle = 'New Test Todo';
    component.newTodoDueDate = '2025-07-05';
    component.addTodo();

    expect(todoService.addTodo).toHaveBeenCalledWith({
      title: 'New Test Todo',
      dueDate: '2025-07-05',
      completed: false
    });
    expect(component.newTodoTitle).toBe('');
    expect(component.newTodoDueDate).toBe('');
    expect(component.loadTodos).toHaveBeenCalled();
  });

  it('should edit a todo', () => {
    const todoToEdit = { id: 1, title: 'Original', dueDate: '2025-07-01', completed: false };
    component.editTodo(todoToEdit);
    expect(component.editingTodo).toEqual(todoToEdit);
    expect(component.editingTodo).not.toBe(todoToEdit); // 参照が異なることを確認
  });

  it('should update a todo', () => {
    spyOn(todoService, 'updateTodo').and.callThrough();
    spyOn(component, 'loadTodos');

    const todoToUpdate = { id: 1, title: 'Updated', dueDate: '2025-07-01', completed: true };
    component.editingTodo = todoToUpdate;
    component.updateTodo();

    expect(todoService.updateTodo).toHaveBeenCalledWith(todoToUpdate);
    expect(component.editingTodo).toBeNull();
    expect(component.loadTodos).toHaveBeenCalled();
  });

  it('should delete a todo', () => {
    spyOn(todoService, 'deleteTodo').and.callThrough();
    spyOn(component, 'loadTodos');

    const todoIdToDelete = 1;
    component.deleteTodo(todoIdToDelete);

    expect(todoService.deleteTodo).toHaveBeenCalledWith(todoIdToDelete);
    expect(component.loadTodos).toHaveBeenCalled();
  });

  it('should toggle completed status', () => {
    spyOn(todoService, 'updateTodo').and.callThrough();
    spyOn(component, 'loadTodos');

    const todoToToggle = { id: 1, title: 'Test', dueDate: '2025-07-01', completed: false };
    todoToToggle.completed = !todoToToggle.completed; // ngModelの挙動をシミュレート
    component.toggleCompleted(todoToToggle);

    expect(todoToToggle.completed).toBeTrue();
    expect(todoService.updateTodo).toHaveBeenCalledWith(todoToToggle);
    expect(component.loadTodos).toHaveBeenCalled();
  });

  it('should render todos in the template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('li');
    expect(listItems.length).toBe(mockTodos.length);
    expect(listItems[0].querySelector('span')?.textContent).toContain('Mock Todo 1');
    expect(listItems[0].querySelector('.due-date')?.textContent).toContain('2025-07-01');
  });

  it('should apply completed class to completed todos', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const completedTodoElement = compiled.querySelector('li:nth-child(2) span'); // Mock Todo 2 is completed
    expect(completedTodoElement?.classList).toContain('completed');
  });
});
