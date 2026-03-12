const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as now;");
    res.json({ status: "ok", db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "DB connection failed" });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, credits, created_at",
      [email, passwordHash]
    );

    return res.status(201).json({
      message: "User registered",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, email, password_hash, credits FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, credits: user.credits },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      "SELECT id, email, credits, created_at FROM users WHERE id=$1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, credits FROM users ORDER BY credits DESC LIMIT 20"
    );

    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Admin stats
app.get("/admin/stats", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const users = await pool.query("SELECT COUNT(*) FROM users");
    const events = await pool.query("SELECT COUNT(*) FROM events");
    const predictions = await pool.query("SELECT COUNT(*) FROM predictions");
    const marketsOpen = await pool.query("SELECT COUNT(*) FROM markets WHERE status='OPEN'");
    const marketsLocked = await pool.query("SELECT COUNT(*) FROM markets WHERE status='LOCKED'");
    const marketsResolved = await pool.query("SELECT COUNT(*) FROM markets WHERE status='RESOLVED'");

    res.json({
      stats: {
        total_users: Number(users.rows[0].count),
        total_events: Number(events.rows[0].count),
        total_predictions: Number(predictions.rows[0].count),
        markets_open: Number(marketsOpen.rows[0].count),
        markets_locked: Number(marketsLocked.rows[0].count),
        markets_resolved: Number(marketsResolved.rows[0].count),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Admin get all markets
app.get("/admin/markets", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      SELECT
        m.id as market_id,
        m.type as market_type,
        m.multiplier,
        m.cutoff_at,
        m.status,
        m.result,
        e.id as event_id,
        e.name as event_name,
        e.sport
      FROM markets m
      JOIN events e ON m.event_id = e.id
      ORDER BY m.id ASC
      `
    );

    res.json({ markets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch markets" });
  }
});

// Admin create event
app.post("/admin/events", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { sport, name, starts_at } = req.body;

    if (!sport || !name || !starts_at) {
      return res.status(400).json({ message: "sport, name and starts_at are required" });
    }

    const result = await pool.query(
      "INSERT INTO events (sport, name, starts_at) VALUES ($1, $2, $3) RETURNING id, sport, name, starts_at",
      [sport, name, starts_at]
    );

    return res.status(201).json({
      message: "Event created",
      event: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Admin create markets for event
app.post("/admin/events/:id/markets", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const eventId = req.params.id;
    const { markets } = req.body;

    if (!markets || !Array.isArray(markets) || markets.length === 0) {
      return res.status(400).json({ message: "markets array is required" });
    }

    const created = [];

    for (const m of markets) {
      if (!m.type || !m.multiplier || !m.cutoff_at) {
        return res.status(400).json({ message: "Each market needs type, multiplier and cutoff_at" });
      }

      const result = await pool.query(
        "INSERT INTO markets (event_id, type, multiplier, cutoff_at) VALUES ($1, $2, $3, $4) RETURNING id, type, multiplier, cutoff_at, status",
        [eventId, m.type, m.multiplier, m.cutoff_at]
      );

      created.push(result.rows[0]);
    }

    return res.status(201).json({
      message: "Markets created",
      markets: created,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// NEW: Get options for a market
app.get("/markets/:id/options", async (req, res) => {
  try {
    const marketId = req.params.id;

    const result = await pool.query(
      "SELECT id, value, label FROM market_options WHERE market_id=$1 ORDER BY label ASC",
      [marketId]
    );

    res.json({ options: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch market options" });
  }
});

app.get("/events", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, sport, name, starts_at FROM events ORDER BY starts_at ASC"
    );

    res.json({ events: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await pool.query(
      "SELECT id, sport, name, starts_at FROM events WHERE id=$1",
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

app.get("/events/:id/markets", async (req, res) => {
  try {
    const eventId = req.params.id;

    const result = await pool.query(
      "SELECT id, type, multiplier, cutoff_at, status FROM markets WHERE event_id=$1 ORDER BY id",
      [eventId]
    );

    res.json({ markets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch markets" });
  }
});

app.post("/predictions", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const { market_id, selection, stake } = req.body;

    if (!market_id || !selection || stake === undefined || stake === null) {
      return res.status(400).json({ message: "market_id, selection and stake required" });
    }

    const stakeNum = Number(stake);
    if (!Number.isFinite(stakeNum) || stakeNum <= 0) {
      return res.status(400).json({ message: "Stake must be greater than 0" });
    }

    await client.query("BEGIN");

    const marketResult = await client.query(
      "SELECT id, status, cutoff_at FROM markets WHERE id=$1 FOR UPDATE",
      [market_id]
    );

    if (marketResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Market not found" });
    }

    const market = marketResult.rows[0];

    if (market.status !== "OPEN") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Market not open" });
    }

    if (new Date() > new Date(market.cutoff_at)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Cutoff time passed" });
    }

    const updatedUser = await client.query(
      "UPDATE users SET credits = credits - $1 WHERE id=$2 AND credits >= $1 RETURNING credits",
      [stakeNum, userId]
    );

    if (updatedUser.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient credits" });
    }

    await client.query(
      "INSERT INTO predictions (user_id, market_id, selection, stake) VALUES ($1, $2, $3, $4)",
      [userId, market_id, selection, stakeNum]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Prediction submitted successfully",
      credits: updatedUser.rows[0].credits,
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    console.error(err);

    if (err.code === "23505") {
      return res.status(400).json({ message: "Already predicted this market" });
    }

    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

app.get("/predictions/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT 
        p.id as prediction_id,
        p.selection,
        p.stake,
        p.status as prediction_status,
        p.submitted_at,
        m.id as market_id,
        m.type as market_type,
        m.multiplier,
        m.status as market_status,
        m.result as market_result,
        e.id as event_id,
        e.sport,
        e.name as event_name,
        e.starts_at
      FROM predictions p
      JOIN markets m ON p.market_id = m.id
      JOIN events e ON m.event_id = e.id
      WHERE p.user_id = $1
      ORDER BY p.submitted_at DESC
      `,
      [userId]
    );

    res.json({ predictions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
});

app.get("/markets/:id", async (req, res) => {
  try {
    const marketId = req.params.id;

    const result = await pool.query(
      `
      SELECT
        m.id as market_id,
        m.type as market_type,
        m.multiplier,
        m.cutoff_at,
        m.status,
        m.result,
        e.id as event_id,
        e.sport,
        e.name as event_name,
        e.starts_at
      FROM markets m
      JOIN events e ON m.event_id = e.id
      WHERE m.id = $1
      `,
      [marketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Market not found" });
    }

    res.json({ market: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch market" });
  }
});

app.post("/markets/:id/resolve", async (req, res) => {
  const client = await pool.connect();

  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const marketId = req.params.id;
    const { result } = req.body;

    if (!result) {
      return res.status(400).json({ message: "Result value required" });
    }

    await client.query("BEGIN");

    const marketResult = await client.query(
      "SELECT id, status, multiplier FROM markets WHERE id=$1 FOR UPDATE",
      [marketId]
    );

    if (marketResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Market not found" });
    }

    const market = marketResult.rows[0];

    if (market.status === "RESOLVED") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Market already resolved" });
    }

    if (market.status === "OPEN") {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Market is still OPEN. Lock it after cutoff before resolving." });
    }

    await client.query(
      "UPDATE markets SET result=$1, status='RESOLVED' WHERE id=$2",
      [result, marketId]
    );

    const predictions = await client.query(
      "SELECT id, user_id, selection, stake FROM predictions WHERE market_id=$1 FOR UPDATE",
      [marketId]
    );

    let wonCount = 0;
    let lostCount = 0;

    for (const prediction of predictions.rows) {
      if (prediction.selection === result) {
        const payout = Number(prediction.stake) * Number(market.multiplier);

        await client.query(
          "UPDATE users SET credits = credits + $1 WHERE id=$2",
          [payout, prediction.user_id]
        );

        await client.query(
          "UPDATE predictions SET status='WON' WHERE id=$1",
          [prediction.id]
        );

        wonCount += 1;
      } else {
        await client.query(
          "UPDATE predictions SET status='LOST' WHERE id=$1",
          [prediction.id]
        );

        lostCount += 1;
      }
    }

    await client.query("COMMIT");

    return res.json({
      message: "Market resolved successfully",
      market_id: Number(marketId),
      predictions_total: predictions.rowCount,
      won: wonCount,
      lost: lostCount,
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}

    console.error(err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

app.post("/markets/auto-lock", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      UPDATE markets
      SET status = 'LOCKED'
      WHERE status = 'OPEN'
        AND cutoff_at <= NOW()
      RETURNING id, event_id, type, cutoff_at, status
      `
    );

    res.json({
      message: "Auto-lock complete",
      locked_count: result.rowCount,
      locked_markets: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
