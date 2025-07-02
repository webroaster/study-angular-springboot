package com.example.demo;

// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
import java.time.LocalDate;

// @Entity // MyBatis 移行により不要
public class Todo {

    // @Id // MyBatis 移行により不要
    //  @GeneratedValue(strategy = GenerationType.IDENTITY) // MyBatis 移行により不要
    private Long id;
    private String title;
    private LocalDate dueDate;
    private boolean completed;

    public Todo() {
    }

    public Todo(String title, LocalDate dueDate, boolean completed) {
        this.title = title;
        this.dueDate = dueDate;
        this.completed = completed;
    }

    // テスト用にID付きコンストラクタも用意
    public Todo(Long id, String title, LocalDate dueDate, boolean completed) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.completed = completed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

}
