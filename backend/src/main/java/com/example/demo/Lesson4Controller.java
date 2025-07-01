package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class Lesson4Controller {

    @Autowired
    private MessageRepository messageRepository;

    // アプリケーション起動時に初期データを投入
    public Lesson4Controller(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
        if (messageRepository.count() == 0) {
            messageRepository.save(new Message("Hello from DB 1"));
            messageRepository.save(new Message("Hello from DB 2"));
            messageRepository.save(new Message("Hello from DB 3"));
        }
    }

    // TODO: "/api/messages" へのGETリクエストで、すべてのメッセージをリストとして返すメソッドを作成してください。
    // ヒント: messageRepository.findAll() を使います。戻り値は List<Message> 型です。

}
