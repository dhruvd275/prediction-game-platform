-- ============================================================
-- 005: Expanded seed data — driver options + new events
-- Run after 004_add_market_options.sql
-- ============================================================

DO $$
DECLARE
  f1_options JSONB := '[
    {"code": "VER", "label": "Max Verstappen"},
    {"code": "NOR", "label": "Lando Norris"},
    {"code": "LEC", "label": "Charles Leclerc"},
    {"code": "HAM", "label": "Lewis Hamilton"},
    {"code": "RUS", "label": "George Russell"},
    {"code": "PIA", "label": "Oscar Piastri"},
    {"code": "ALO", "label": "Fernando Alonso"},
    {"code": "SAI", "label": "Carlos Sainz"}
  ]';
  football_winner JSONB := '[
    {"code": "HOME", "label": "Arsenal Win"},
    {"code": "DRAW", "label": "Draw"},
    {"code": "AWAY", "label": "Chelsea Win"}
  ]';
  both_teams_score JSONB := '[
    {"code": "YES", "label": "Yes"},
    {"code": "NO", "label": "No"}
  ]';
  aus_id   INTEGER;
  footy_id INTEGER;
BEGIN

  -- ─── Update existing Bahrain GP markets with driver options ─────────────────
  UPDATE markets
  SET options = f1_options
  WHERE event_id = (SELECT id FROM events WHERE name = 'Bahrain Grand Prix 2026' LIMIT 1);

  -- ─── Australian Grand Prix 2026 ─────────────────────────────────────────────
  INSERT INTO events (sport, name, starts_at)
  VALUES ('F1', 'Australian Grand Prix 2026', NOW() + INTERVAL '21 days')
  RETURNING id INTO aus_id;

  INSERT INTO markets (event_id, type, multiplier, cutoff_at, options) VALUES
    (aus_id, 'race_p1',   3.00, NOW() + INTERVAL '20 days',              f1_options),
    (aus_id, 'race_p2',   2.50, NOW() + INTERVAL '20 days',              f1_options),
    (aus_id, 'race_p3',   2.00, NOW() + INTERVAL '20 days',              f1_options),
    (aus_id, 'pole',      2.50, NOW() + INTERVAL '19 days 12 hours',     f1_options),
    (aus_id, 'sprint_p1', 2.50, NOW() + INTERVAL '19 days',              f1_options);

  -- ─── Arsenal vs Chelsea — Premier League ────────────────────────────────────
  INSERT INTO events (sport, name, starts_at)
  VALUES ('FOOTBALL', 'Arsenal vs Chelsea — Premier League', NOW() + INTERVAL '14 days')
  RETURNING id INTO footy_id;

  INSERT INTO markets (event_id, type, multiplier, cutoff_at, options) VALUES
    (footy_id, 'match_winner',     2.00, NOW() + INTERVAL '13 days 22 hours', football_winner),
    (footy_id, 'both_teams_score', 1.80, NOW() + INTERVAL '13 days 22 hours', both_teams_score);

END $$;
