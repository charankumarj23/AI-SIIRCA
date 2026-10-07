import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function IncidentInvestigation() {
  const { id } = useParams();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
const [actionMessage, setActionMessage] = useState("");
const [resolution, setResolution] = useState("");
const [newStatus, setNewStatus] = useState(
  incident?.status || "New"
);

  const loadIncident = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/incidents",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const selectedIncident = response.data.find(
        (item) => String(item.id) === String(id)
      );

      if (!selectedIncident) {
        setError("Incident not found");
        return;
      }

      setIncident(selectedIncident);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Failed to load incident"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [id]);

  const updateStatus = async () => {
  try {
    setActionLoading(true);
    setActionMessage("");

    const token = localStorage.getItem("token");

    const response = await axios.patch(
      `http://localhost:5000/api/incident-actions/${id}/status`,
      {
        status: newStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setActionMessage(
      `Status updated to ${response.data.newStatus}`
    );

    await loadIncident();
  } catch (error) {
    setActionMessage(
      error.response?.data?.error ||
        "Failed to update incident status"
    );
  } finally {
    setActionLoading(false);
  }
};

const resolveIncident = async () => {
  try {
    setActionLoading(true);
    setActionMessage("");

    const token = localStorage.getItem("token");

    const response = await axios.patch(
      `http://localhost:5000/api/incident-actions/${id}/resolve`,
      {
        resolution,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setActionMessage(
      `Incident resolved successfully`
    );

    setResolution("");

    await loadIncident();
  } catch (error) {
    setActionMessage(
      error.response?.data?.error ||
        "Failed to resolve incident"
    );
  } finally {
    setActionLoading(false);
  }
};

  if (loading) {
    return (
      <div className="incident-investigation-loading">
        Loading incident investigation...
      </div>
    );
  }

  if (error) {
    return (
      <div className="incident-investigation-error">
        {error}
        <br />
        <Link to="/incidents">
          ← Back to Incidents
        </Link>
      </div>
    );
  }

  return (
    <div className="soc-layout">
      <aside className="soc-sidebar">
        <h2>AI-SIIRCA</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/incidents">Incidents</Link>
          <Link to="/security-events">
            Security Events
          </Link>
        </nav>
      </aside>

      <main className="soc-main">
        <div className="soc-header">
          <div>
            <h1>Incident Investigation</h1>

            <p>
              {incident.incident_key} — {incident.title}
            </p>
          </div>

          <Link
            to="/incidents"
            className="incident-back"
          >
            ← Back to Incidents
          </Link>
        </div>

        <div className="investigation-summary">
          <div className="investigation-card">
            <span>Severity</span>
            <strong>{incident.severity}</strong>
          </div>

          <div className="investigation-card">
            <span>Status</span>
            <strong>{incident.status}</strong>
          </div>

          <div className="investigation-card">
            <span>Risk Score</span>
            <strong>
              {incident.risk_score}/100
            </strong>
          </div>

          <div className="investigation-card">
            <span>Events</span>
            <strong>{incident.event_count}</strong>
          </div>
        </div>
<div className="investigation-section">
  <h2>Analyst Actions</h2>

  <div className="action-controls">
    <div className="action-group">
      <label>Update Status</label>

      <select
        value={newStatus}
        onChange={(event) =>
          setNewStatus(event.target.value)
        }
        disabled={actionLoading}
      >
        <option value="New">New</option>
        <option value="Assigned">Assigned</option>
        <option value="Investigating">
          Investigating
        </option>
        <option value="Confirmed">Confirmed</option>
        <option value="Contained">Contained</option>
        <option value="Resolved">Resolved</option>
      </select>

      <button
        onClick={updateStatus}
        disabled={actionLoading}
      >
        {actionLoading
          ? "Updating..."
          : "Update Status"}
      </button>
    </div>

    <div className="action-group">
      <label>Resolution Details</label>

      <textarea
        value={resolution}
        onChange={(event) =>
          setResolution(event.target.value)
        }
        placeholder="Enter incident resolution details..."
        rows="4"
        disabled={actionLoading}
      />

      <button
        onClick={resolveIncident}
        disabled={actionLoading || !resolution.trim()}
      >
        {actionLoading
          ? "Resolving..."
          : "Resolve Incident"}
      </button>
    </div>
  </div>

  {actionMessage && (
    <div className="action-message">
      {actionMessage}
    </div>
  )}
</div>
        <div className="investigation-section">
          <h2>Root-Cause Hypothesis</h2>

          <p>
            {incident.rootCause?.hypothesis ||
              "No root-cause hypothesis available."}
          </p>

          <span>
            Confidence:{" "}
            {incident.rootCause?.confidence ?? 0}%
          </span>
        </div>

        <div className="investigation-section">
  <h2>AI Investigation Guidance</h2>

  <p>
    {incident.investigationGuidance?.summary ||
      "No investigation guidance available."}
  </p>

  <div className="guidance-grid">
    <div className="guidance-card">
      <h3>Recommended Actions</h3>

      {incident.investigationGuidance?.recommendedActions
        ?.length > 0 ? (
        <ul>
          {incident.investigationGuidance.recommendedActions.map(
            (action, index) => (
              <li key={index}>{action}</li>
            )
          )}
        </ul>
      ) : (
        <p>No recommended actions available.</p>
      )}
    </div>

    <div className="guidance-card">
      <h3>Investigation Questions</h3>

      {incident.investigationGuidance?.investigationQuestions
        ?.length > 0 ? (
        <ul>
          {incident.investigationGuidance.investigationQuestions.map(
            (question, index) => (
              <li key={index}>{question}</li>
            )
          )}
        </ul>
      ) : (
        <p>No investigation questions available.</p>
      )}
    </div>
  </div>
</div>

        <div className="investigation-section">
          <h2>Timeline Reconstruction</h2>

          {incident.timeline?.length > 0 ? (
            <div className="investigation-timeline">
              {incident.timeline.map((event, index) => (
                <div
                  className="timeline-item"
                  key={`${event.eventId}-${index}`}
                >
                  <div className="timeline-marker" />

                  <div className="timeline-content">
                    <div className="timeline-top">
                      <strong>{event.eventType}</strong>

                      <span className="timeline-time">
                        {new Date(
                          event.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>

                    <p>
                      {event.message ||
                        "No event message available."}
                    </p>

                    <div className="timeline-meta">
                      <span>
                        Source: {event.source || "-"}
                      </span>

                      <span>
                        IP: {event.sourceIp || "-"}
                      </span>

                      <span>
                        User: {event.username || "-"}
                      </span>

                      <span>
                        Risk: {event.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No timeline events available.</p>
          )}
        </div>

        <div className="investigation-section">
          <h2>Attack / Relationship Graph</h2>

          {incident.attackGraph?.nodes?.length > 0 ? (
            <div className="attack-graph">
              <div className="graph-stats">
                <span>
                  Nodes:{" "}
                  {incident.attackGraph.nodes.length}
                </span>

                <span>
                  Relationships:{" "}
                  {incident.attackGraph.edges.length}
                </span>
              </div>

              <div className="graph-nodes">
                {incident.attackGraph.nodes.map(
                  (node) => (
                    <div
                      className="graph-node"
                      key={node.id}
                    >
                      <span className="graph-node-type">
                        {node.type}
                      </span>

                      <strong>{node.label}</strong>

                      {node.data?.eventId && (
                        <small>
                          Event #{node.data.eventId}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="graph-relationships">
                <h3>Relationships</h3>

                {incident.attackGraph.edges.map(
                  (edge, index) => (
                    <div
                      className="graph-edge"
                      key={`${edge.source}-${edge.target}-${index}`}
                    >
                      <span>{edge.source}</span>

                      <strong>→</strong>

                      <span>{edge.target}</span>

                      <small>
                        {edge.relationship}
                      </small>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <p>
              No attack relationships available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default IncidentInvestigation;