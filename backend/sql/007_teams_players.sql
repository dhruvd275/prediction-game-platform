CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  sport TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(sport, code)
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport);