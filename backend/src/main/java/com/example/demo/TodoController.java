package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    @Autowired
    private TodoMapper todoMapper; // TodoRepository(JPA) から TodoMapper(MyBatis) に変更

    // すべてのTODOを取得するGET API
    @GetMapping
    public List<Todo> getAllTodos() {
        return this.todoMapper.findAll();
    }

    // 新しいTODOを作成するPOST API
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        if (todo.getTitle() == null || todo.getTitle().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        todoMapper.save(todo);
        return ResponseEntity.ok(todo);
    }

    // 指定されたIDのTODOを更新するPUT API
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        Optional<Todo> optionalTodo = todoMapper.findById(id);
        if (optionalTodo.isPresent()) {
            Todo existingTodo = optionalTodo.get();
            existingTodo.setTitle(todo.getTitle());
            existingTodo.setDueDate(todo.getDueDate());
            existingTodo.setCompleted(todo.isCompleted());
            todoMapper.update(existingTodo);
            return ResponseEntity.ok(existingTodo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 指定されたIDのTODOを削除するDELETE API
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoMapper.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
