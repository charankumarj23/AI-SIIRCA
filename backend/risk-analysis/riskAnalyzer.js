function analyzeRisk(event) {
  let score = 0;
  const reasons = [];

  const eventType = (event.event_type || "").toUpperCase();
  const severity = (event.severity || "").toLowerCase();
  const message = (event.message || "").toLowerCase();
  const username = (event.username || "").toLowerCase();

  // Severity-based scoring
  if (severity === "critical") {
    score += 40;
    reasons.push("Critical severity event");
  } else if (severity === "high") {
    score += 30;
    reasons.push("High severity event");
  } else if (severity === "medium") {
    score += 20;
    reasons.push("Medium severity event");
  } else if (severity === "low") {
    score += 5;
  }

  // Event type analysis
  if (
    eventType === "LOGIN_FAILURE" ||
    eventType === "BRUTE_FORCE"
  ) {
    score += 15;
    reasons.push("Authentication attack indicator");
  }

  if (
    eventType.includes("MALWARE") ||
    eventType.includes("RANSOMWARE")
  ) {
    score += 30;
    reasons.push("Malware-related event");
  }

  if (
    eventType.includes("PRIVILEGE") ||
    eventType.includes("ESCALATION")
  ) {
    score += 20;
    reasons.push("Privilege escalation indicator");
  }

  // Suspicious message patterns
  if (
    message.includes("multiple failed") ||
    message.includes("repeated failed") ||
    message.includes("suspicious") ||
    message.includes("attack")
  ) {
    score += 15;
    reasons.push("Suspicious activity detected");
  }

  // Privileged accounts
  if (
    username === "admin" ||
    username === "administrator" ||
    username === "root"
  ) {
    score += 20;
    reasons.push("Privileged account involved");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  let riskLevel = "low";

  if (score >= 81) {
    riskLevel = "critical";
  } else if (score >= 61) {
    riskLevel = "high";
  } else if (score >= 31) {
    riskLevel = "medium";
  }

  return {
    riskScore: score,
    riskLevel,
    reasons,
  };
}

module.exports = analyzeRisk;