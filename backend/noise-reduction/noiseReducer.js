function noiseReducer(event, recentEvents, windowMinutes = 5) {
  const eventTime = new Date(event.event_timestamp).getTime();
  const windowMs = windowMinutes * 60 * 1000;

  const duplicate = recentEvents.find((recentEvent) => {
    const recentTime = new Date(recentEvent.event_timestamp).getTime();

    const sameEventType =
      recentEvent.event_type === event.event_type;

    const sameSourceIp =
      recentEvent.source_ip === event.source_ip;

    const sameUsername =
      recentEvent.username === event.username;

    const sameSource =
      recentEvent.source === event.source;

    const withinTimeWindow =
      Math.abs(eventTime - recentTime) <= windowMs;

    return (
      sameEventType &&
      sameSourceIp &&
      sameUsername &&
      sameSource &&
      withinTimeWindow
    );
  });

  if (duplicate) {
    return {
      isNoise: true,
      reason: "Duplicate security event",
      duplicateOf: duplicate.id,
      event,
    };
  }

  return {
    isNoise: false,
    reason: "Unique security event",
    duplicateOf: null,
    event,
  };
}

module.exports = noiseReducer;