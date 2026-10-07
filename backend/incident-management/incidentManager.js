function createIncident(events) {
  if (!events || events.length === 0) {
    return null;
  }

  const highestRiskEvent = events.reduce((highest, current) => {
    return current.risk_score > highest.risk_score
      ? current
      : highest;
  }, events[0]);

  const hasHighRisk = (highestRiskEvent.risk_score || 0) >= 61;
  const hasCorrelation = events.length > 1;

  if (!hasHighRisk && !hasCorrelation) {
    return null;
  }

  return {
    incidentKey: `INC-${Date.now()}`,
    title: "Possible Security Incident",
    severity: highestRiskEvent.risk_level || "low",
    status: "New",
    primaryUser: highestRiskEvent.username || null,
    primarySourceIp: highestRiskEvent.source_ip || null,
    eventCount: events.length,
    relatedEventIds: events
      .map((event) => event.id)
      .filter(Boolean),
    riskScore: highestRiskEvent.risk_score || 0,
    createdAt: new Date().toISOString(),
  };
}

module.exports = createIncident;