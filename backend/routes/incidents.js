const express = require("express");
const pool = require("../database/db");
const authenticateToken = require("../middleware/auth");
const buildTimeline = require("../timeline-reconstruction/timelineBuilder");
const buildAttackGraph = require("../attack-graph/attackGraphBuilder");
const analyzeRootCause = require("../root-cause/rootCauseAnalyzer");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM incidents
       ORDER BY created_at DESC`
    );

    const incidents = result.rows;

    for (const incident of incidents) {
      const eventIds = incident.related_event_ids || [];

      if (eventIds.length === 0) {
        incident.timeline = [];
        continue;
      }

      const eventsResult = await pool.query(
        `SELECT *
         FROM security_events
         WHERE id = ANY($1::integer[])`,
        [eventIds]
      );

      incident.timeline = buildTimeline(eventsResult.rows);
      incident.attackGraph = buildAttackGraph(eventsResult.rows);
      incident.rootCause = analyzeRootCause(eventsResult.rows);
    }

    return res.json(incidents);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      error: "Failed to fetch incidents"
    });
  }
});

module.exports = router;