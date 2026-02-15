-- Insert F1 Event
INSERT INTO events (sport, name, starts_at)
VALUES (
  'F1',
  'Bahrain Grand Prix 2026',
  NOW() + INTERVAL '7 days'
);

-- Create markets for the event
-- We assume the event we just created has id = 1
-- (If not, we will adjust)

INSERT INTO markets (event_id, type, multiplier, cutoff_at)
VALUES
  (1, 'race_p1', 3.00, NOW() + INTERVAL '6 days'),
  (1, 'race_p2', 2.50, NOW() + INTERVAL '6 days'),
  (1, 'race_p3', 2.00, NOW() + INTERVAL '6 days'),
  (1, 'pole', 2.50, NOW() + INTERVAL '5 days'),
  (1, 'sprint_p1', 2.50, NOW() + INTERVAL '6 days'),
  (1, 'sprint_p2', 2.00, NOW() + INTERVAL '6 days'),
  (1, 'sprint_p3', 1.80, NOW() + INTERVAL '6 days');