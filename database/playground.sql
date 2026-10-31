--  select *from users;
use the_written_leaf;
-- select username,display_name,email from users;
 -- select *from book_entries where author='george orwell';
 -- select *from book_entries where END_date=null;
 -- select *from book_entries where visibility='private';
 -- select *from book_entries where available_for_lending=true;
 -- select *from book_entries where End_date>'2026-02-01';
 -- select *from book_entries order by title asc;
 -- insert into users(username,display_name,email,password_hash,bio)
--  values('leo_reads','leo','leo12@gamil.com','leao_hash','Books, coffee and rainy afternoons.');
 -- update users set bio="Trying to read a little more every day." where user_id=6 ;
  -- update book_entries set visibility='private' where entry_id=2;
  -- update book_entries set end_date='2026-09-12' where user_id=6;
 --  select *from lending_requests;
--   update lending_requests set status='available' where owner_id=6;
-- SELECT users.display_name, book_entries.title FROM users JOIN book_entries ON users.user_id = book_entries.user_id;

-- SELECT u.display_name, b.title, b.author FROM users u JOIN book_entries b ON u.user_id = b.user_id WHERE b.visibility = 'public';
-- SELECT u.display_name FROM users u JOIN likes l ON u.user_id = l.user_id JOIN book_entries b
-- ON l.entry_id = b.entry_id WHERE b.title = '1984';
UPDATE users
SET password_hash = 'scrypt:32768:8:1$D8wPJSLEOEL5E2b8$a1d836bd2b252df083b31610b221e4d5179da0da8937874b9f7657536e2298912f25d8aeaa458202049b1d9f42687929fc9667a319e39cb9014c79833b1273e0'
WHERE user_id = 1
  AND email = 'aisha@example.com';
  
  SELECT user_id, username, email,
       LEFT(password_hash, 7) AS hash_type
FROM users
WHERE user_id = 1;
select *from book_entries;