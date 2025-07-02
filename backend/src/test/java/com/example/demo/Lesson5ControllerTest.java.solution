package com.example.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(Lesson5Controller.class)
public class Lesson5ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MessageRepository messageRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testGetAllMessages() throws Exception {
        List<Message> messages = Arrays.asList(
                new Message(1L, "Test Message 1"),
                new Message(2L, "Test Message 2")
        );
        when(messageRepository.findAll()).thenReturn(messages);

        mockMvc.perform(get("/api/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Test Message 1"))
                .andExpect(jsonPath("$[1].content").value("Test Message 2"));
    }

    @Test
    public void testAddMessage() throws Exception {
        Message newMessage = new Message("New Message");
        Message savedMessage = new Message(3L, "New Message");

        when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

        mockMvc.perform(post("/api/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newMessage)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.content").value("New Message"));
    }

    @Test
    public void testDeleteMessage() throws Exception {
        Long messageId = 1L;
        doNothing().when(messageRepository).deleteById(messageId);
        when(messageRepository.existsById(messageId)).thenReturn(true);

        mockMvc.perform(delete("/api/messages/{id}", messageId))
                .andExpect(status().isNoContent());

        verify(messageRepository, times(1)).deleteById(messageId);
    }
}
