function buildAttackGraph(events) {
  if (!events || events.length === 0) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const nodes = [];
  const edges = [];

  const addNode = (id, type, label, data = {}) => {
    if (!nodes.some((node) => node.id === id)) {
      nodes.push({
        id,
        type,
        label,
        data,
      });
    }
  };

  events.forEach((event) => {
    const eventId = `event-${event.id}`;

    addNode(
      eventId,
      "event",
      event.event_type,
      {
        eventId: event.id,
        timestamp: event.event_timestamp,
        severity: event.severity,
        riskScore: event.risk_score || 0,
      }
    );

    if (event.source_ip) {
      const ipId = `ip-${event.source_ip}`;

      addNode(
        ipId,
        "source_ip",
        event.source_ip
      );

      edges.push({
        source: ipId,
        target: eventId,
        relationship: "generated",
      });
    }

    if (event.username) {
      const userId = `user-${event.username}`;

      addNode(
        userId,
        "user",
        event.username
      );

      edges.push({
        source: userId,
        target: eventId,
        relationship: "associated_with",
      });
    }
  });

  return {
    nodes,
    edges,
  };
}

module.exports = buildAttackGraph;