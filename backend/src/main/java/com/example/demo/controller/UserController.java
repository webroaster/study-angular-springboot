package com.example.demo.controller;

import com.example.demo.api.UsersApi;
import com.example.demo.dto.UserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class UserController implements UsersApi {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @Override
  public ResponseEntity<UserResponse> createUser(UserRequest userRequest) {
    if (userRequest.getUsername() == null || userRequest.getUsername().isEmpty()) {
      return ResponseEntity.badRequest().build();
    }
    User user = convertToEntity(userRequest);
    User savedUser = userService.save(user);
    return ResponseEntity.ok(convertToResponse(savedUser));
  }

  @Override
  public ResponseEntity<Void> deleteUser(Long id) {
    userService.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  @Override
  public ResponseEntity<UserResponse> getUserByUsernameAndPassword(String username, String password) {
    Optional<User> user = userService.findByUsernameAndPassword(username, password);
    if (user.isPresent()) {
      return ResponseEntity.ok(convertToResponse(user.get()));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @Override
  public ResponseEntity<UserResponse> updateUser(Long id, UserRequest userRequest) {
    Optional<User> optionalUser = userService.findById(id);
    if (optionalUser.isPresent()) {
      User existingUser = optionalUser.get();
      existingUser.setUsername(userRequest.getUsername());
      existingUser.setDisplayName(userRequest.getDisplayName());
      existingUser.setPassword(userRequest.getPassword());
      existingUser.setStatus(userRequest.getStatus());
      User updatedUser = userService.update(existingUser);
      return ResponseEntity.ok(convertToResponse(updatedUser));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  private User convertToEntity(UserRequest userRequest) {
    User user = new User();
    user.setUsername(userRequest.getUsername());
    user.setDisplayName(userRequest.getDisplayName());
    user.setPassword(userRequest.getPassword());
    user.setStatus(userRequest.getStatus());
    return user;
  }

  private UserResponse convertToResponse(User user) {
    UserResponse userResponse = new UserResponse();
    userResponse.setId(user.getId());
    userResponse.setUsername(user.getUsername());
    userResponse.setDisplayName(user.getDisplayName());
    userResponse.setPassword(user.getPassword());
    userResponse.setStatus(user.getStatus());
    return userResponse;
  }
}