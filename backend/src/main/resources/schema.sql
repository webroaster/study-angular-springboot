DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TABLE todos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  due_date VARCHAR(255),
  completed BOOLEAN NOT NULL
);

CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username: VARCHAR(255) NOT NULL,
  displayName: VARCHAR(255),
  password: VARCHAR(30),
  status: VARCHAR(10)
);

INSERT INTO users (username, displayName, password, status) VALUES ('admin', '管理者', 'password', 'enable');
