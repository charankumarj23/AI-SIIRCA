const express = require("express");
const pool = require("../database/db");
const authenticateToken = require("../middleware/auth");

const {
  updateIncidentStatus,
  assignIncident,
  resolveIncident,
} = require("../incident-actions/incidentActionManager");

const router = express.Router();

router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `SELECT *
       FROM incidents
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Incident not found",
      });
    }

    const action = await updateIncidentStatus(
      result.rows[0],
      status
    );

    if (!action.success) {
      return res.status(400).json(action);
    }

    return res.json(action);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      error: "Failed to update incident status",
    });
  }
});

router.patch("/:id/assign", authenticateToken, async (req, res) => {
  try {
    const { analystId } = req.body;

    const result = await pool.query(
      `SELECT *
       FROM incidents
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Incident not found",
      });
    }

    const action = await assignIncident(
      result.rows[0],
      analystId
    );

    if (!action.success) {
      return res.status(400).json(action);
    }

    return res.json(action);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      error: "Failed to assign incident",
    });
  }
});

router.patch("/:id/resolve", authenticateToken, async (req, res) => {
  try {
    const { resolution } = req.body;

    const result = await pool.query(
      `SELECT *
       FROM incidents
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Incident not found",
      });
    }

    const action = await resolveIncident(
      result.rows[0],
      resolution
    );

    if (!action.success) {
      return res.status(400).json(action);
    }

    return res.json(action);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      error: "Failed to resolve incident",
    });
  }
});

module.exports = router;