const express = require("express");
const pool = require("../database/db");
const authenticateToken = require("../middleware/auth");
const normalizeEvent = require("../normalization/normalizeEvent");
const noiseReducer = require("../noise-reduction/noiseReducer");
const analyzeRisk = require("../risk-analysis/riskAnalyzer");
const correlateEvents = require("../event-correlation/eventCorrelator");

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
const riskResult = analyzeRisk(normalizedEvent);

normalizedEvent.risk_score = riskResult.riskScore;
normalizedEvent.risk_level = riskResult.riskLevel;
normalizedEvent.risk_reasons = riskResult.reasons;

const correlationResult = correlateEvents(
  normalizedEvent,
  recentEventsResult.rows
);

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
    event_timestamp,
    risk_score,
    risk_level,
    risk_reasons,
    correlation_count,
    correlated_event_ids
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    COALESCE($8, CURRENT_TIMESTAMP),
    $9, $10, $11, $12, $13
  )
  RETURNING *`,
  [
    event_type,
    source,
    source_ip,
    destination_ip,
    username,
    severity || "low",
    message,
    event_timestamp || null,
    riskResult.riskScore,
    riskResult.riskLevel,
    riskResult.reasons,
    correlationResult.correlationCount,
    correlationResult.relatedEvents.map((event) => event.id)
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