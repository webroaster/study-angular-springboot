package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
