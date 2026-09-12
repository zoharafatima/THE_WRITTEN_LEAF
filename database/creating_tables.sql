-- create database the_written_leaf;
use the_written_leaf;
select database();
-- CREATE TABLE users (
--     user_id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) NOT NULL UNIQUE,
--     display_name VARCHAR(100) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password_hash VARCHAR(255) NOT NULL,
--     bio TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- create table book_entries(
--  entry_id int primary key auto_increment,user_id int,title varchar(225) not null,author varchar(225) not null,front_cover varchar(500),back_cover varchar(500),
--  start_date DATE,End_date DATE,reflection TEXT,visibilty ENUM('public','private') default 'private',available_for_lending BOOLEAN default false,created_at timestamp default current_timestamp,
--  constraint users_user_id foreign key(user_id) references users(user_id));
 
-- alter table book_entries rename column visibilty to visibility;

--  create table likes(
-- like_id int auto_increment primary key,user_id int not null,entry_id int not null,created_at timestamp default current_timestamp,
-- constraint likes_user_id foreign key(user_id) references users(user_id),constraint book_entries_entry_id foreign key(entry_id)
-- references book_entries(entry_id), unique(user_id,entry_id));

-- CREATE TABLE lending_requests (
--     request_id INT AUTO_INCREMENT PRIMARY KEY,
--     book_entry_id INT NOT NULL,
--     borrower_id INT NOT NULL,
--     owner_id INT NOT NULL,
--     status ENUM(
--         'pending',
--         'accepted',
--         'declined',
--         'completed',
--         'cancelled'
--     ) DEFAULT 'pending',
--     requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     responded_at TIMESTAMP NULL,
--     FOREIGN KEY (book_entry_id)REFERENCES book_entries(entry_id),
--     FOREIGN KEY (borrower_id) REFERENCES users(user_id),
--     FOREIGN KEY (owner_id) REFERENCES users(user_id)
-- );
-- SHOW TABLES;



