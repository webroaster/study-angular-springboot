package com.example.demo.controller;

import com.example.demo.service.UserService;
import com.example.demo.User;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public List<User> getAllUsers() {
    return userService.findAll();
  }

  @GetMapping(params = {"username", "password"})
  public ResponseEntity<User> getUserByUsernameAndPassword(
      @RequestParam("username") String username,
      @RequestParam("password") String password) {
    Optional<User> user = userService.findByUsernameAndPassword(username, password);
    if (user.isPresent()) {
      return ResponseEntity.ok(user.get());
    } else {
      return ResponseEntity.notFound().build();
    }
  }


  @PostMapping
  public ResponseEntity<User> createUser(@RequestBody User user) {
    if (user.getUsername() == null || user.getUsername().isEmpty()) {
      return ResponseEntity.badRequest().build();
    }
    User savedUser = userService.save(user);
    return ResponseEntity.ok(savedUser);
  }

  @PutMapping("/{id}")
  public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
    Optional<User> optionalUser = userService.findById(id);
    if (optionalUser.isPresent()) {
      User existingUser = optionalUser.get();
      existingUser.setUsername(user.getUsername());
      existingUser.setDisplayName(user.getDisplayName());
      existingUser.setPassword(user.getPassword());
      existingUser.setStatus(user.getStatus());
      User updatedUser = userService.update(existingUser);
      return ResponseEntity.ok(updatedUser);
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
