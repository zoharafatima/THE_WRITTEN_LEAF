-- INSERT INTO users
-- (username, display_name, email, password_hash, bio)
-- VALUES
-- ('aisha_reads', 'Aisha', 'aisha@example.com', 'hash_aisha', 'Stories, tea, and quiet evenings.'),
-- ('sara_pages', 'Sara', 'sara@example.com', 'hash_sara', 'Always looking for my next favourite book.'),
-- ('maya_reads', 'Maya', 'maya@example.com', 'hash_maya', 'Mysteries and old classics.'),
-- ('noah_ink', 'Noah', 'noah@example.com', 'hash_noah', 'Reading slowly, remembering deeply.'),
-- ('zoya_books', 'Zoya', 'zoya@example.com', 'hash_zoya', 'A shelf full of unfinished stories.');

-- INSERT INTO book_entries
-- (user_id, title, author, front_cover, back_cover, start_date, END_date, reflection, visibility, available_for_lending)
-- VALUES
-- (1, '1984', 'George Orwell', '1984_front.jpg', '1984_back.jpg',
--  '2026-01-10', '2026-01-18',
--  'A disturbing reminder of how easily truth can be controlled.',
--  'public', TRUE),

-- (1, 'The Alchemist', 'Paulo Coelho', 'alchemist_front.jpg', 'alchemist_back.jpg',
--  '2026-02-02', '2026-02-08',
--  'A simple story that made me think differently about purpose.',
--  'private', FALSE),

-- (2, 'The Book Thief', 'Markus Zusak', 'bookthief_front.jpg', 'bookthief_back.jpg',
--  '2026-01-15', '2026-02-01',
--  'Beautiful, painful, and unforgettable.',
--  'public', TRUE),

-- (2, 'Pride and Prejudice', 'Jane Austen', 'pride_front.jpg', 'pride_back.jpg',
--  '2026-03-05', NULL,
--  'Still reading. Elizabeth Bennet is becoming one of my favourite characters.',
--  'public', FALSE),

-- (3, 'The Murder of Roger Ackroyd', 'Agatha Christie', 'roger_front.jpg', 'roger_back.jpg',
--  '2026-02-20', '2026-02-25',
--  'The mystery kept me guessing until the end.',
--  'public', TRUE),

-- (3, 'The Great Gatsby', 'F. Scott Fitzgerald', 'gatsby_front.jpg', 'gatsby_back.jpg',
--  '2026-03-01', '2026-03-07',
--  'Short, atmospheric, and much sadder than I expected.',
--  'private', FALSE),

-- (4, 'The Little Prince', 'Antoine de Saint-Exupéry', 'littleprince_front.jpg', 'littleprince_back.jpg',
--  '2026-01-05', '2026-01-07',
--  'A small book with surprisingly large ideas.',
--  'public', TRUE),

-- (5, 'The Midnight Library', 'Matt Haig', 'midnight_front.jpg', 'midnight_back.jpg',
--  '2026-03-10', NULL,
--  'Currently somewhere between the pages and my thoughts.',
--  'public', FALSE);

-- INSERT INTO likes
-- (user_id, entry_id)
-- VALUES
-- (2, 1),
-- (3, 1),
-- (4, 1),
-- (1, 3),
-- (3, 3),
-- (5, 3),
-- (1, 5),
-- (2, 5),
-- (4, 7),
-- (5, 7);

-- INSERT INTO lending_requests
-- (book_entry_id, borrower_id, owner_id, status)
-- VALUES
-- (1, 2, 1, 'pending'),
-- (3, 4, 2, 'accepted'),
-- (5, 1, 3, 'declined'),
-- (7, 5, 4, 'pending'),
-- (1, 3, 1, 'completed');