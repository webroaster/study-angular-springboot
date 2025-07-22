package com.example.demo.service;

import com.example.demo.mapper.TodoMapper;
import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.entity.Todo;
import com.example.demo.exception.InternalServerErrorException;
import com.example.demo.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TodoService {

  private final TodoMapper todoMapper;

  public TodoService(TodoMapper todoMapper) {
    this.todoMapper = todoMapper;
  }

  public List<TodoResponse> findAll() {
    List<Todo> todos = todoMapper.selectByExample(null);
    return todos.stream()
      .map(this::toResponse)
      .collect(Collectors.toList());
  }

  public Optional<Todo> findById(Long id) {
    return Optional.ofNullable(todoMapper.selectByPrimaryKey(id));
  }

  public TodoResponse createTodo(TodoRequest todoRequest) {
    if (todoRequest == null) {
      throw new IllegalArgumentException("Todo request must not be null");
    }

    Todo todo = toEntity(todoRequest);
    todoMapper.insertSelective(todo);
    return toResponse(todo);
  }

  public TodoResponse updateTodo(Long id, TodoRequest todoRequest) {
    if (todoRequest == null) {
      throw new IllegalArgumentException("Todo request must not be null");
    }

    Todo existingTodo;

    try {
      existingTodo = todoMapper.selectByPrimaryKey(id);
    } catch (Exception e) {
      throw new InternalServerErrorException("Failed to update todo with id" + id + " due to an internal error.", e);
    }

    if (existingTodo == null) {
      throw new ResourceNotFoundException("Todo with id" + id + " not found");
    }

    Todo todoToUpdate = toEntity(todoRequest);
    todoToUpdate.setId(id);
    todoMapper.updateByPrimaryKey(todoToUpdate);
    return toResponse(todoMapper.selectByPrimaryKey(id));
  }

  public void deleteById(Long id) {
    todoMapper.deleteByPrimaryKey(id);
  }

  private Todo toEntity(TodoRequest request) {
    Todo entity = new Todo();
    entity.setTitle(request.getTitle());
    entity.setDueDate(request.getDueDate());
    entity.setCompleted(request.getCompleted());
    return entity;
  }

  private TodoResponse toResponse(Todo entity) {
      if (entity == null) {
          return null;
      }
      TodoResponse response = new TodoResponse();
      response.setId(entity.getId());
      response.setTitle(entity.getTitle());
      response.setDueDate(entity.getDueDate());
      response.setCompleted(entity.getCompleted());
      return response;
  }
}
