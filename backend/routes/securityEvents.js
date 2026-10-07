const express = require("express");
const pool = require("../database/db");
const authenticateToken = require("../middleware/auth");
const normalizeEvent = require("../normalization/normalizeEvent");
const noiseReducer = require("../noise-reduction/noiseReducer");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM security_events
       ORDER BY event_timestamp DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Failed to fetch security events"
    });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const normalizedEvent = normalizeEvent(req.body);
    const recentEventsResult = await pool.query(
  `SELECT *
   FROM security_events
   WHERE event_timestamp >= CURRENT_TIMESTAMP - INTERVAL '5 minutes'
   ORDER BY event_timestamp DESC`
);

const noiseResult = noiseReducer(
  normalizedEvent,
  recentEventsResult.rows
);

if (noiseResult.isNoise) {
  return res.status(200).json({
    message: "Duplicate security event detected",
    noise: true,
    reason: noiseResult.reason,
    duplicateOf: noiseResult.duplicateOf
  });
}

const {
  event_type,
  source,
  source_ip,
  destination_ip,
  username,
  severity,
  message,
  event_timestamp
} = normalizedEvent;

    if (!event_type) {
      return res.status(400).json({
        error: "event_type is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO security_events
      (
        event_type,
        source,
        source_ip,
        destination_ip,
        username,
        severity,
        message,
        event_timestamp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP))
      RETURNING *`,
      [
        event_type,
        source,
        source_ip,
        destination_ip,
        username,
        severity || "low",
        message,
        event_timestamp || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Failed to create security event"
    });
  }
});

module.exports = router;