package com.example.demo.service;

import com.example.demo.mapper.UserMapper;
import com.example.demo.User;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

  private final UserMapper userMapper;

  public UserService(UserMapper userMapper) {
    this.userMapper = userMapper;
  }

  public List<User> findAll() {
    return userMapper.findAll();
  }

  public Optional<User> findById(Long id) {
    return userMapper.findById(id);
  }

  @Transactional
  public User save(User user) {
    userMapper.save(user);
    return user;
  }

  @Transactional
  public User update(User user) {
    userMapper.update(user);
    return user;
  }

  @Transactional
  public void deleteById(Long id) {
    userMapper.deleteById(id);
  }

  public Optional<User> findByUsernameAndPassword(String username, String password) {
    return userMapper.findByUsernameAndPassword(username, password);
  }
}
