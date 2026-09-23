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
SELECT users.display_name, book_entries.title
FROM users
JOIN book_entries
ON users.user_id = book_entries.user_id;
