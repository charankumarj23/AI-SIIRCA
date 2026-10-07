function correlateEvents(event, recentEvents, windowMinutes = 10) {
  const eventTime = new Date(event.event_timestamp).getTime();
  const windowMs = windowMinutes * 60 * 1000;

  const relatedEvents = recentEvents.filter((recentEvent) => {
    const recentTime = new Date(
      recentEvent.event_timestamp
    ).getTime();

    const sameSourceIp =
      event.source_ip &&
      recentEvent.source_ip &&
      event.source_ip === recentEvent.source_ip;

    const sameUsername =
      event.username &&
      recentEvent.username &&
      event.username === recentEvent.username;

    const sameEventType =
      event.event_type &&
      recentEvent.event_type &&
      event.event_type === recentEvent.event_type;

    const withinTimeWindow =
      Math.abs(eventTime - recentTime) <= windowMs;

    return (
      withinTimeWindow &&
      (sameSourceIp || sameUsername || sameEventType)
    );
  });

  return {
    correlated: relatedEvents.length > 0,
    correlationCount: relatedEvents.length,
    relatedEvents,
  };
}

module.exports = correlateEvents;