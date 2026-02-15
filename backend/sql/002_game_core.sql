-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  sport TEXT NOT NULL,                         -- "F1" or "FOOTBALL"
  name TEXT NOT NULL,
  starts_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- MARKETS TABLE
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                          -- race_p1, race_p2, pole, sprint_p1, match_winner
  multiplier NUMERIC(10,2) NOT NULL,           -- payout multiplier (e.g., 2.50, 3.00)
  cutoff_at TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',         -- OPEN, LOCKED, FINISHED, RESOLVED
  result TEXT,                                 -- actual result value
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  selection TEXT NOT NULL,                     -- e.g. "VER", "HAM", "HOME"
  stake NUMERIC(10,2) NOT NULL,                -- credits staked
  status TEXT NOT NULL DEFAULT 'PENDING',      -- PENDING, WON, LOST
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, market_id)                   -- prevents duplicate prediction per market
);