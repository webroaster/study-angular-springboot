package com.example.demo;

import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TodoMapper {

  @Select("SELECT id, title, due_date, completed FROM todos ORDER BY id")
  List<Todo> findAll();

  @Select("SELECT id, title, due_date, completed FROM todos WHERE id = #{id}")
  Optional<Todo> findById(Long id);

  @Insert("INSERT INTO todos (title, due_date, completed) VALUES (#{title}, #{dueDate}, #{completed})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  void save(Todo todo);

  @Update("UPDATE todos SET title = #{title}, due_date = #{dueDate}, completed = #{completed} WHERE id = #{id}")
  void update(Todo todo);

  @Delete("DELETE FROM todos WHERE id = #{id}")
  void deleteById(Long id);

  boolean existsById(Long id);
}
