package com.example.demo.service;

import com.example.demo.mapper.TodoMapper;
import com.example.demo.dto.TodoRequest;
import com.example.demo.dto.TodoResponse;
import com.example.demo.entity.Todo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TodoService {

  private final TodoMapper todoMapper;

  public TodoService(TodoMapper todoMapper) {
    this.todoMapper = todoMapper;
  }

  public List<Todo> findAll() {
    return todoMapper.selectByExample(null);
  }

  public Optional<Todo> findById(Integer id) {
    return Optional.ofNullable(todoMapper.selectByPrimaryKey(id));
  }

  public TodoResponse createTodo(TodoRequest todoRequest) {
    if (todoRequest == null) {
      throw new IllegalArgumentException("Todo request must not be null");
    }

    Todo todo = toEntity
  }

  public void deleteById(Integer id) {
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
