CREATE DATABASE code-app; 

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT,
  email TEXT,
  password_digest TEXT,
  created_at TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT,
  body TEXT,
  created_at TIMESTAMP
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  user_id INTEGER REFERENCES users(id),
  answer_text TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);