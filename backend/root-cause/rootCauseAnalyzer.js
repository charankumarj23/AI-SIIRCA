function analyzeRootCause(events) {
  if (!events || events.length === 0) {
    return {
      hypothesis: null,
      confidence: 0,
      evidence: [],
    };
  }

  const evidence = [];
  let score = 0;

  const eventTypes = events.map((event) =>
    (event.event_type || "").toUpperCase()
  );

  const hasBruteForce =
    eventTypes.includes("BRUTE_FORCE") ||
    eventTypes.includes("LOGIN_FAILURE");

  const hasPrivilegeEscalation = eventTypes.some(
    (type) =>
      type.includes("PRIVILEGE") ||
      type.includes("ESCALATION")
  );

  const hasMalware = eventTypes.some(
    (type) =>
      type.includes("MALWARE") ||
      type.includes("RANSOMWARE")
  );

  if (hasBruteForce) {
    score += 30;
    evidence.push("Authentication attack activity detected");
  }

  if (hasPrivilegeEscalation) {
    score += 30;
    evidence.push("Privilege escalation activity detected");
  }

  if (hasMalware) {
    score += 40;
    evidence.push("Malware-related activity detected");
  }

  let hypothesis = "Suspicious activity detected";

  if (hasMalware && hasPrivilegeEscalation) {
    hypothesis =
      "Possible malware-driven privilege escalation";
  } else if (hasMalware) {
    hypothesis =
      "Possible malware or ransomware infection";
  } else if (hasPrivilegeEscalation) {
    hypothesis =
      "Possible privilege escalation attack";
  } else if (hasBruteForce) {
    hypothesis =
      "Possible credential attack or brute-force activity";
  }

  const confidence = Math.min(score, 100);

  return {
    hypothesis,
    confidence,
    evidence,
  };
}

module.exports = analyzeRootCause;