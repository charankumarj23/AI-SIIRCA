function buildTimeline(events) {
  if (!events || events.length === 0) {
    return [];
  }

  return events
    .filter((event) => event.event_timestamp)
    .sort(
      (a, b) =>
        new Date(a.event_timestamp) - new Date(b.event_timestamp)
    )
    .map((event) => ({
      eventId: event.id,
      timestamp: event.event_timestamp,
      eventType: event.event_type,
      source: event.source || null,
      sourceIp: event.source_ip || null,
      username: event.username || null,
      severity: event.severity || "low",
      riskScore: event.risk_score || 0,
      message: event.message || "",
    }));
}

module.exports = buildTimeline;