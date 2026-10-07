function normalizeEvent(rawEvent) {
  return {
    event_type: rawEvent.event_type || rawEvent.type || "UNKNOWN",
    source: rawEvent.source || rawEvent.source_name || "unknown",
    source_ip: rawEvent.source_ip || rawEvent.src_ip || null,
    destination_ip:
      rawEvent.destination_ip || rawEvent.dest_ip || null,
    username: rawEvent.username || rawEvent.user || null,
    severity: rawEvent.severity || "low",
    message: rawEvent.message || rawEvent.description || "",
    event_timestamp:
      rawEvent.event_timestamp ||
      rawEvent.timestamp ||
      new Date().toISOString(),
  };
}

module.exports = normalizeEvent;