package com.example.demo;

public class User {
  private Long id;
  private String username;
  private String displayName;
  private String password;
  private String status;

  public User() {}

  public User(
    String username,
    String displayName,
    String password,
    String status
  ) {
    this.username = username;
    this. displayName = displayName;
    this.password = password;
    this.status = status;
  }

  // テスト用で id 付きコンストラクタも用意
  public User(
    Long id,
    String username,
    String displayName,
    String password,
    String status
  ) {
    this.id = id;
    this.username = username;
    this. displayName = displayName;
    this.password = password;
    this.status = status;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}