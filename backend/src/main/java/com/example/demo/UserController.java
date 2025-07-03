package com.example.demo;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

  @Autowired
  private UserMapper userMapper;

  @GetMapping
  public List<User> getAllUsers() {
    return this.userMapper.findAll();
  }

  @GetMapping(params = {"username", "password"})
  public ResponseEntity<User> getUserByUsernameAndPassword(
      @RequestParam("username") String username,
      @RequestParam("password") String password) {
    Optional<User> user = userMapper.findByUsernameAndPassword(username, password);
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
    userMapper.save(user);
    return ResponseEntity.ok(user);
  }

  @PutMapping("/{id}")
  public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
    Optional<User> optionalUser = userMapper.findById(id);
    if (optionalUser.isPresent()) {
      User existingUser = optionalUser.get();
      existingUser.setUsername(user.getUsername());
      existingUser.setDisplayName(user.getDisplayName());
      existingUser.setPassword(user.getPassword());
      existingUser.setStatus(user.getStatus());
      userMapper.update(existingUser);
      return ResponseEntity.ok(existingUser);
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userMapper.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}
