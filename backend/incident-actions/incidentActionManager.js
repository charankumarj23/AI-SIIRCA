const pool = require("../database/db");
async function updateIncidentStatus(incident, newStatus) {
  const allowedStatuses = [
    "New",
    "Assigned",
    "Investigating",
    "Confirmed",
    "Contained",
    "Resolved",
  ];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      success: false,
      error: "Invalid incident status",
    };
  }

  await pool.query(
    `UPDATE incidents
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [newStatus, incident.id]
  );

  return {
    success: true,
    incidentId: incident.id,
    previousStatus: incident.status,
    newStatus,
    updatedAt: new Date().toISOString(),
  };
}

async function assignIncident(incident, analystId) {
  if (!analystId) {
    return {
      success: false,
      error: "Analyst ID is required",
    };
  }

  await pool.query(
    `UPDATE incidents
     SET assigned_to = $1,
         status = 'Assigned',
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [analystId, incident.id]
  );

  return {
    success: true,
    incidentId: incident.id,
    assignedTo: analystId,
    action: "Incident assigned to analyst",
    updatedAt: new Date().toISOString(),
  };
}

async function resolveIncident(incident, resolution) {
  if (!resolution || !resolution.trim()) {
    return {
      success: false,
      error: "Resolution details are required",
    };
  }

  await pool.query(
    `UPDATE incidents
     SET status = 'Resolved',
         resolution = $1,
         resolved_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [resolution.trim(), incident.id]
  );

  return {
    success: true,
    incidentId: incident.id,
    status: "Resolved",
    resolution: resolution.trim(),
    resolvedAt: new Date().toISOString(),
  };
}

module.exports = {
  updateIncidentStatus,
  assignIncident,
  resolveIncident,
};