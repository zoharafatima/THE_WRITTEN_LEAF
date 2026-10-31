-- The Written Leaf: database schema
-- Safe to run on a fresh MySQL (e.g. your deployment host). Locally you've
-- already created these tables; compare this file against yours, and keep the
-- column names identical because app.py depends on them.

CREATE DATABASE IF NOT EXISTS the_written_leaf
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE the_written_leaf;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)  NOT NULL UNIQUE,
  display_name  VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  bio           TEXT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_entries (
  entry_id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT NOT NULL,
  title                 VARCHAR(255) NOT NULL,
  author                VARCHAR(255) NOT NULL,
  front_cover           VARCHAR(500) NULL,
  back_cover            VARCHAR(500) NULL,
  start_date            DATE NULL,
  end_date           DATE NULL,
  reflection            TEXT NULL,
  visibility            ENUM('public','private') NOT NULL DEFAULT 'private',
  available_for_lending BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_entries_user (user_id),
  INDEX idx_entries_visibility (visibility, created_at)
);

CREATE TABLE IF NOT EXISTS likes (
  like_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  entry_id   INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, entry_id),
  FOREIGN KEY (user_id)  REFERENCES users(user_id)        ON DELETE CASCADE,
  FOREIGN KEY (entry_id) REFERENCES book_entries(entry_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lending_requests (
  request_id    INT AUTO_INCREMENT PRIMARY KEY,
  book_entry_id INT NOT NULL,
  borrower_id   INT NOT NULL,
  owner_id      INT NOT NULL,
  status        ENUM('pending','accepted','declined','completed','cancelled')
                NOT NULL DEFAULT 'pending',
  requested_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at  TIMESTAMP NULL,
  FOREIGN KEY (book_entry_id) REFERENCES book_entries(entry_id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id)   REFERENCES users(user_id)         ON DELETE CASCADE,
  FOREIGN KEY (owner_id)      REFERENCES users(user_id)         ON DELETE CASCADE
);
