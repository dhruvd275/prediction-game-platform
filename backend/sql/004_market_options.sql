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
    ('HAM', 'Lewis Hamilton'),
    ('LEC', 'Charles Leclerc'),
    ('NOR', 'Lando Norris'),
    ('PIA', 'Oscar Piastri'),
    ('SAI', 'Carlos Sainz'),
    ('RUS', 'George Russell'),
    ('ALO', 'Fernando Alonso'),
    ('STR', 'Lance Stroll'),
    ('GAS', 'Pierre Gasly'),
    ('OCO', 'Esteban Ocon'),
    ('TSU', 'Yuki Tsunoda'),
    ('ALB', 'Alexander Albon'),
    ('SAR', 'Logan Sargeant'),
    ('BOT', 'Valtteri Bottas'),
    ('ZHO', 'Zhou Guanyu'),
    ('MAG', 'Kevin Magnussen'),
    ('HUL', 'Nico Hulkenberg'),
    ('RIC', 'Daniel Ricciardo'),
    ('LAW', 'Liam Lawson')
) AS d(value, label);