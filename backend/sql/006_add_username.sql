ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;

-- Backfill existing users with a placeholder based on their id
UPDATE users SET username = 'user' || id WHERE username IS NULL;

-- Now make it required and unique
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);