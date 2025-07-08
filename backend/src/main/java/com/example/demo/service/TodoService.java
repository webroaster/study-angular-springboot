package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Todo;
import com.example.demo.mapper.TodoMapper;

@Service
public class TodoService {

  private final TodoMapper todoMapper;

  public TodoService(TodoMapper todoMapper) {
    this.todoMapper = todoMapper;
  }

  public List<Todo> findAll() {
    return todoMapper.findAll();
  }

  public Optional<Todo> findById(Long id) {
    return todoMapper.findById(id);
  }

  @Transactional
  public Todo save(Todo todo) {
    todoMapper.save(todo);
    return todo;
  }

  @Transactional
  public Todo update(Todo todo) {
    todoMapper.update(todo);
    return todo;
  }

  @Transactional
  public void deleteById(Long id) {
    todoMapper.deleteById(id);
  }
}
