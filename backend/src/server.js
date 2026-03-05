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

// ─── Admin Auth Helper ────────────────────────────────────────────────────────
function adminAuth(req, res) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_SECRET) {
    res.status(403).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

// ─── Health ───────────────────────────────────────────────────────────────────
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

// ─── Auth ─────────────────────────────────────────────────────────────────────
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

    return res.status(201).json({ message: "User registered", user: result.rows[0] });
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

// ─── User ─────────────────────────────────────────────────────────────────────
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, credits, created_at FROM users WHERE id=$1",
      [req.user.userId]
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

// ─── Events ───────────────────────────────────────────────────────────────────
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
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

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
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const result = await pool.query(
      "SELECT id, type, multiplier, cutoff_at, status, options FROM markets WHERE event_id=$1 ORDER BY id",
      [eventId]
    );

    res.json({ markets: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch markets" });
  }
});

// ─── Markets ──────────────────────────────────────────────────────────────────
app.get("/markets/:id", async (req, res) => {
  try {
    const marketId = parseInt(req.params.id);
    if (isNaN(marketId)) {
      return res.status(400).json({ message: "Invalid market id" });
    }

    const result = await pool.query(
      `SELECT
        m.id          AS market_id,
        m.type        AS market_type,
        m.multiplier,
        m.cutoff_at,
        m.status,
        m.result,
        m.options,
        e.id          AS event_id,
        e.sport,
        e.name        AS event_name,
        e.starts_at
      FROM markets m
      JOIN events e ON m.event_id = e.id
      WHERE m.id = $1`,
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

app.get("/markets/:id/options", async (req, res) => {
  try {
    const marketId = parseInt(req.params.id);
    if (isNaN(marketId)) {
      return res.status(400).json({ message: "Invalid market id" });
    }

    const result = await pool.query(
      "SELECT options FROM markets WHERE id=$1",
      [marketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Market not found" });
    }

    res.json({ options: result.rows[0].options || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch market options" });
  }
});

// ─── Predictions ──────────────────────────────────────────────────────────────
app.post("/predictions", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user.userId;
    const { market_id, selection, stake } = req.body;

    if (!market_id || !selection || stake === undefined || stake === null) {
      return res.status(400).json({ message: "market_id, selection and stake required" });
    }

    const stakeNum = Number(stake);
    if (!Number.isFinite(stakeNum) || stakeNum < 1) {
      return res.status(400).json({ message: "Minimum stake is 1 credit" });
    }

    await client.query("BEGIN");

    // Lock the market row so status/cutoff can't change mid-request
    const marketResult = await client.query(
      "SELECT id, status, cutoff_at, options FROM markets WHERE id=$1 FOR UPDATE",
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

    // Validate selection against market options if options are defined
    if (market.options && Array.isArray(market.options) && market.options.length > 0) {
      const validCodes = market.options.map(o => o.code);
      if (!validCodes.includes(selection)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Invalid selection",
          valid_options: validCodes,
        });
      }
    }

    // Atomically deduct credits only if user has enough
    const updatedUser = await client.query(
      "UPDATE users SET credits = credits - $1 WHERE id=$2 AND credits >= $1 RETURNING credits",
      [stakeNum, userId]
    );

    if (updatedUser.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // Insert prediction (unique constraint prevents duplicate per market)
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
    try { await client.query("ROLLBACK"); } catch (_) {}
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
    const result = await pool.query(
      `SELECT
        p.id            AS prediction_id,
        p.selection,
        p.stake,
        p.status        AS prediction_status,
        p.submitted_at,
        m.id            AS market_id,
        m.type          AS market_type,
        m.multiplier,
        m.status        AS market_status,
        m.result        AS market_result,
        e.id            AS event_id,
        e.sport,
        e.name          AS event_name,
        e.starts_at
      FROM predictions p
      JOIN markets m ON p.market_id = m.id
      JOIN events e ON m.event_id = e.id
      WHERE p.user_id = $1
      ORDER BY p.submitted_at DESC`,
      [req.user.userId]
    );

    res.json({ predictions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch predictions" });
  }
});

// ─── Leaderboard ──────────────────────────────────────────────────────────────
app.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const result = await pool.query(
      "SELECT id, email, credits FROM users ORDER BY credits DESC LIMIT $1",
      [limit]
    );

    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// ─── Admin: Market Operations ─────────────────────────────────────────────────
app.post("/markets/auto-lock", async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const result = await pool.query(
      `UPDATE markets
       SET status = 'LOCKED'
       WHERE status = 'OPEN' AND cutoff_at <= NOW()
       RETURNING id, event_id, type, cutoff_at, status`
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

app.post("/markets/:id/resolve", async (req, res) => {
  if (!adminAuth(req, res)) return;

  const client = await pool.connect();

  try {
    const marketId = parseInt(req.params.id);
    if (isNaN(marketId)) {
      return res.status(400).json({ message: "Invalid market id" });
    }

    const { result } = req.body;
    if (!result) {
      return res.status(400).json({ message: "Result value required" });
    }

    await client.query("BEGIN");

    // Lock market row so it can't be resolved twice
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
      return res.status(400).json({ message: "Market is still OPEN. Lock it after cutoff before resolving." });
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
      market_id: marketId,
      predictions_total: predictions.rowCount,
      won: wonCount,
      lost: lostCount,
    });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch (_) {}
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

// ─── Admin: Create Events & Markets ──────────────────────────────────────────
app.post("/admin/events", async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const { sport, name, starts_at } = req.body;

    if (!sport || !name || !starts_at) {
      return res.status(400).json({ message: "sport, name and starts_at required" });
    }

    const validSports = ["F1", "FOOTBALL"];
    if (!validSports.includes(sport.toUpperCase())) {
      return res.status(400).json({ message: `sport must be one of: ${validSports.join(", ")}` });
    }

    const result = await pool.query(
      "INSERT INTO events (sport, name, starts_at) VALUES ($1, $2, $3) RETURNING id, sport, name, starts_at, created_at",
      [sport.toUpperCase(), name, starts_at]
    );

    res.status(201).json({ message: "Event created", event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/admin/markets", async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const { event_id, type, multiplier, cutoff_at, options } = req.body;

    if (!event_id || !type || multiplier === undefined || !cutoff_at) {
      return res.status(400).json({ message: "event_id, type, multiplier and cutoff_at required" });
    }

    const multiplierNum = Number(multiplier);
    if (!Number.isFinite(multiplierNum) || multiplierNum <= 1) {
      return res.status(400).json({ message: "Multiplier must be greater than 1" });
    }

    const event = await pool.query("SELECT id FROM events WHERE id=$1", [event_id]);
    if (event.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const result = await pool.query(
      "INSERT INTO markets (event_id, type, multiplier, cutoff_at, options) VALUES ($1, $2, $3, $4, $5) RETURNING id, event_id, type, multiplier, cutoff_at, status, options",
      [event_id, type, multiplierNum, cutoff_at, options || null]
    );

    res.status(201).json({ message: "Market created", market: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Admin: User Credits ──────────────────────────────────────────────────────
app.post("/admin/users/:id/credits", async (req, res) => {
  if (!adminAuth(req, res)) return;

  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { amount } = req.body;
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: "amount required" });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum === 0) {
      return res.status(400).json({ message: "amount must be a non-zero number" });
    }

    // GREATEST(0, ...) prevents credits going negative on deduction
    const result = await pool.query(
      "UPDATE users SET credits = GREATEST(0, credits + $1) WHERE id=$2 RETURNING id, email, credits",
      [amountNum, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Credits updated", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
