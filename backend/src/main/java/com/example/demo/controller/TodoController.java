
package com.example.demo.controller;

import com.example.demo.api.TodosApi;
import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.service.TodoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TodoController implements TodosApi {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @Override
    public ResponseEntity<List<TodoResponse>> getAllTodos() {
        List<TodoResponse> todoResponses = todoService.findAll();
        return ResponseEntity.ok(todoResponses);
    }

    @Override
    public ResponseEntity<TodoResponse> createTodo(TodoRequest todoRequest) {
        if (todoRequest.getTitle() == null || todoRequest.getTitle().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        TodoResponse savedTodo = todoService.createTodo(todoRequest);
        return ResponseEntity.ok(savedTodo);
    }

    @Override
    public ResponseEntity<TodoResponse> updateTodo(Long id, TodoRequest todoRequest) {
        TodoResponse updatedTodo = todoService.updateTodo(id, todoRequest);
        return ResponseEntity.ok(updatedTodo);
    }

    @Override
    public ResponseEntity<Void> deleteTodo(Long id) {
        todoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
