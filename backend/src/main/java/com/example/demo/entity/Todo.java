package com.example.demo.entity;

import java.time.LocalDate;

public class Todo {
    /**
     *
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column TODOS.ID
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    private Long id;

    /**
     *
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column TODOS.TITLE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    private String title;

    /**
     *
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column TODOS.DUE_DATE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    private LocalDate dueDate;

    /**
     *
     * This field was generated by MyBatis Generator.
     * This field corresponds to the database column TODOS.COMPLETED
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    private Boolean completed;

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column TODOS.ID
     *
     * @return the value of TODOS.ID
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public Long getId() {
        return id;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column TODOS.ID
     *
     * @param id the value for TODOS.ID
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column TODOS.TITLE
     *
     * @return the value of TODOS.TITLE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public String getTitle() {
        return title;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column TODOS.TITLE
     *
     * @param title the value for TODOS.TITLE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public void setTitle(String title) {
        this.title = title == null ? null : title.trim();
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column TODOS.DUE_DATE
     *
     * @return the value of TODOS.DUE_DATE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public LocalDate getDueDate() {
        return dueDate;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column TODOS.DUE_DATE
     *
     * @param dueDate the value for TODOS.DUE_DATE
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method returns the value of the database column TODOS.COMPLETED
     *
     * @return the value of TODOS.COMPLETED
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public Boolean getCompleted() {
        return completed;
    }

    /**
     * This method was generated by MyBatis Generator.
     * This method sets the value of the database column TODOS.COMPLETED
     *
     * @param completed the value for TODOS.COMPLETED
     *
     * @mbg.generated Tue Jul 22 17:25:36 JST 2025
     */
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}