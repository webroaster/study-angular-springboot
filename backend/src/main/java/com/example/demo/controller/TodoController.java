
package com.example.demo.controller;

import com.example.demo.api.TodosApi;
import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.entity.Todo;
import com.example.demo.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class TodoController implements TodosApi {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @Override
    public ResponseEntity<List<TodoResponse>> getAllTodos() {
        List<TodoResponse> todoResponses = todoService.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(todoResponses);
    }

    @Override
    public ResponseEntity<TodoResponse> createTodo(TodoRequest todoRequest) {
        if (todoRequest.getTitle() == null || todoRequest.getTitle().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Todo todo = convertToEntity(todoRequest);
        Todo savedTodo = todoService.save(todo);
        return ResponseEntity.ok(convertToResponse(savedTodo));
    }

    @Override
    public ResponseEntity<TodoResponse> updateTodo(Long id, TodoRequest todoRequest) {
        Optional<Todo> optionalTodo = todoService.findById(id);
        if (optionalTodo.isPresent()) {
            Todo existingTodo = optionalTodo.get();
            existingTodo.setTitle(todoRequest.getTitle());
            existingTodo.setDueDate(todoRequest.getDueDate());
            existingTodo.setCompleted(todoRequest.getCompleted());
            Todo updatedTodo = todoService.update(existingTodo);
            return ResponseEntity.ok(convertToResponse(updatedTodo));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Override
    public ResponseEntity<Void> deleteTodo(Long id) {
        todoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Todo convertToEntity(TodoRequest todoRequest) {
        Todo todo = new Todo();
        todo.setTitle(todoRequest.getTitle());
        todo.setDueDate(todoRequest.getDueDate());
        todo.setCompleted(todoRequest.getCompleted());
        return todo;
    }

    private TodoResponse convertToResponse(Todo todo) {
        TodoResponse todoResponse = new TodoResponse();
        todoResponse.setId(todo.getId());
        todoResponse.setTitle(todo.getTitle());
        todoResponse.setDueDate(todo.getDueDate());
        todoResponse.setCompleted(todo.getCompleted());
        return todoResponse;
    }
}
