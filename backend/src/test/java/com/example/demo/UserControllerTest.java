package com.example.demo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.controller.UserController;
import com.example.demo.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebMvcTest(UserController.class)
public class UserControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private UserService userService;

  private ObjectMapper objectMapper;

  @BeforeEach
    public void setup() {
      objectMapper = new ObjectMapper();
    }

  @Test
  void getAllUsers_shouldReturnUserList() throws Exception {
    // Arrange
    User user1 = new User(1L, "testuser1", "TEST_USER_1", "password", "enable");
    User user2 = new User(2L, "testuser2", "TEST_USER_2", "password", "enable");
    List<User> users = Arrays.asList(user1, user2);

    when(userService.findAll()).thenReturn(users);

    // Act & Assert
    mockMvc.perform(get("/api/users"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$", hasSize(2)))
      .andExpect(jsonPath("$[0].id", is(1)))
      .andExpect(jsonPath("$[0].username", is("testuser1")))
      .andExpect(jsonPath("$[1].id", is(2)))
      .andExpect(jsonPath("$[1].username", is("testuser2")));
  }

  @Test
  void createUser_shouldReturnUser() throws Exception {
    // Arrange
    User newUser = new User("newuser1", "新規ユーザー1", "password", "enable");
    User savedUser = new User(3L, "newuser1", "新規ユーザー1", "password", "enable");

    when(userService.save(any(User.class))).thenReturn(savedUser);

    // Act & Assert
    mockMvc.perform(post("/api/users")
      .contentType(MediaType.APPLICATION_JSON)
      .content(objectMapper.writeValueAsString(newUser)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.username").value("newuser1"))
      .andExpect(jsonPath("$.displayName").value("新規ユーザー1"))
      .andExpect(jsonPath("$.password").value("password"))
      .andExpect(jsonPath("$.status").value("enable"));
  }
}
