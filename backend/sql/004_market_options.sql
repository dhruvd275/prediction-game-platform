CREATE TABLE IF NOT EXISTS market_options (
  id SERIAL PRIMARY KEY,
  market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL
);

INSERT INTO market_options (market_id, value, label)
SELECT m.id, d.value, d.label
FROM markets m
CROSS JOIN (
  VALUES
    ('VER', 'Max Verstappen'),
    ('HAD', 'Isack Hadjar'),
    ('NOR', 'Lando Norris'),
    ('PIA', 'Oscar Piastri'),
    ('LEC', 'Charles Leclerc'),
    ('HAM', 'Lewis Hamilton'),
    ('RUS', 'George Russell'),
    ('ANT', 'Kimi Antonelli'),
    ('ALO', 'Fernando Alonso'),
    ('STR', 'Lance Stroll'),
    ('ALB', 'Alexander Albon'),
    ('SAI', 'Carlos Sainz'),
    ('GAS', 'Pierre Gasly'),
    ('COL', 'Franco Colapinto'),
    ('BEA', 'Oliver Bearman'),
    ('BOR', 'Gabriel Bortoleto'),
    ('HUL', 'Nico Hulkenberg'),
    ('DRU', 'Jack Doohan'),
    ('LAW', 'Liam Lawson'),
    ('LIN', 'Arvid Lindblad'),
    ('BOT', 'Valtteri Bottas'),
    ('PER', 'Sergio Perez')
) AS d(value, label);
