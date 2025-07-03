package com.example.demo;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.*;

@Mapper
public interface UserMapper {

  @Select("SELECT id, username, display_name, \"password\", \"status\" FROM users ORDER BY id")
  List<User> findAll();

  @Select("SELECT id, username, display_name, \"password\", \"status\" FROM users WHERE id = #{id}")
  Optional<User> findById(Long id);

  @Select("SELECT id, username, display_name, \"password\", \"status\" FROM users WHERE username = #{username} AND \"password\" = #{password}")
  Optional<User> findByUsernameAndPassword(String username, String password);

  @Insert("INSERT INTO users (username, display_name, \"password\", \"status\") VALUES (#{username}, #{displayName}, #{password}, #{status})")
  @Options(useGeneratedKeys = true, keyProperty = "id")
  void save(User user);

  @Update("UPDATE users SET username = #{username}, display_name = #{displayName}, \"password\" = #{password}, \"status\" = #{status} WHERE id = #{id}")
  void update(User user);

  @Delete("DELETE FROM users WHERE id = #{id}")
  void deleteById(Long id);

  boolean existsById(Long id);
}
