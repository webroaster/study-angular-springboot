package com.example.demo.service;

import com.example.demo.mapper.UserMapper;
import com.example.demo.entity.User;
import com.example.demo.entity.UserExample;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserMapper userMapper;

  public UserService(UserMapper userMapper) {
    this.userMapper = userMapper;
  }

  public List<User> findAll() {
    return userMapper.selectByExample(null);
  }

  public Optional<User> findById(Long id) {
    return Optional.ofNullable(userMapper.selectByPrimaryKey(id));
  }

  @Transactional
  public User save(User user) {
    userMapper.insert(user);
    return user;
  }

  @Transactional
  public User update(User user) {
    userMapper.updateByPrimaryKey(user);
    return user;
  }

  @Transactional
  public void deleteById(Long id) {
    userMapper.deleteByPrimaryKey(id);
  }

  public Optional<User> findByUsernameAndPassword(String username, String password) {
    UserExample example = new UserExample();
    example.createCriteria()
        .andUsernameEqualTo(username)
        .andPasswordEqualTo(password);
    List<User> users = userMapper.selectByExample(example);
    return users.stream().findFirst();
  }
}
