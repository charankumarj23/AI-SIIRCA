function generateInvestigationGuidance(incident) {
  if (!incident) {
    return {
      summary: "No incident data available",
      priority: "low",
      recommendedActions: [],
      investigationQuestions: [],
    };
  }

  const recommendedActions = [];
  const investigationQuestions = [];

  const severity = (incident.severity || "").toLowerCase();
  const rootCause = incident.rootCause || {};
  const hypothesis = rootCause.hypothesis || "";

  if (severity === "critical") {
    recommendedActions.push(
      "Immediately investigate the affected source IP and user account"
    );
    recommendedActions.push(
      "Review all related security events for signs of further compromise"
    );
  } else if (severity === "high") {
    recommendedActions.push(
      "Review correlated events and identify the attack sequence"
    );
    recommendedActions.push(
      "Validate whether the affected account or host is compromised"
    );
  } else {
    recommendedActions.push(
      "Review the incident timeline and related events"
    );
  }

  if (hypothesis.toLowerCase().includes("brute-force")) {
    investigationQuestions.push(
      "Were there repeated authentication failures from the same source IP?"
    );
    investigationQuestions.push(
      "Was the targeted account successfully authenticated after the failures?"
    );
  }

  if (
    hypothesis.toLowerCase().includes("malware") ||
    hypothesis.toLowerCase().includes("ransomware")
  ) {
    investigationQuestions.push(
      "Does the affected host show additional malware-related activity?"
    );
    investigationQuestions.push(
      "Were other systems contacted by the affected host?"
    );
  }

  if (hypothesis.toLowerCase().includes("privilege")) {
    investigationQuestions.push(
      "Was there an unexpected privilege escalation?"
    );
    investigationQuestions.push(
      "Which account performed the privilege change?"
    );
  }

  return {
    summary: `Investigation guidance generated for ${incident.title || "security incident"}`,
    priority: severity || "low",
    recommendedActions,
    investigationQuestions,
  };
}

module.exports = generateInvestigationGuidance;