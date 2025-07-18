package com.example.demo.controller;

import com.example.demo.controller.TodoController;
import com.example.demo.service.TodoService;
import com.example.demo.Todo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodoController.class)
public class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodoService todoService;

    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // LocalDateをJSONに変換するために必要
    }

    @Test
    public void testGetAllTodos() throws Exception {
        Todo todo1 = new Todo(1L, "Buy groceries", LocalDate.of(2025, 7, 10), false);
        Todo todo2 = new Todo(2L, "Walk the dog", LocalDate.of(2025, 7, 5), true);
        when(todoService.findAll()).thenReturn(Arrays.asList(todo1, todo2));

        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Buy groceries"))
                .andExpect(jsonPath("$[1].title").value("Walk the dog"));
    }

    @Test
    public void testCreateTodo() throws Exception {
        Todo newTodo = new Todo("Learn Spring Boot", LocalDate.of(2025, 7, 15), false);
        Todo savedTodo = new Todo(3L, "Learn Spring Boot", LocalDate.of(2025, 7, 15), false);
        when(todoService.save(any(Todo.class))).thenReturn(savedTodo);

        mockMvc.perform(post("/api/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTodo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Learn Spring Boot"));
    }

    @Test
    public void testUpdateTodo() throws Exception {
        Long todoId = 1L;
        Todo existingTodo = new Todo(todoId, "Buy groceries", LocalDate.of(2025, 7, 10), false);
        Todo updatedTodo = new Todo(todoId, "Buy groceries (updated)", LocalDate.of(2025, 7, 11), true);

        when(todoService.findById(todoId)).thenReturn(Optional.of(existingTodo));
        when(todoService.update(any(Todo.class))).thenReturn(updatedTodo);

        mockMvc.perform(put("/api/todos/{id}", todoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTodo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Buy groceries (updated)"))
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    public void testUpdateTodoNotFound() throws Exception {
        Long todoId = 99L;
        Todo updatedTodo = new Todo(todoId, "Non existent", LocalDate.now(), false);

        when(todoService.findById(todoId)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/todos/{id}", todoId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTodo)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void testDeleteTodo() throws Exception {
        Long todoId = 1L;
        doNothing().when(todoService).deleteById(todoId);

        mockMvc.perform(delete("/api/todos/{id}", todoId))
                .andExpect(status().isNoContent());

        verify(todoService, times(1)).deleteById(todoId);
    }
}
