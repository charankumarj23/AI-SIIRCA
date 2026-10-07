import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function IncidentDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIncidents = async () => {
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

      setIncidents(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to load incidents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const getSeverityClass = (severity) => {
    const value = (severity || "").toLowerCase();

    if (value === "critical") return "incident-critical";
    if (value === "high") return "incident-high";
    if (value === "medium") return "incident-medium";

    return "incident-low";
  };

  const getStatusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "resolved") return "status-resolved";
    if (value === "investigating") return "status-investigating";
    if (value === "confirmed") return "status-confirmed";
    if (value === "contained") return "status-contained";

    return "status-default";
  };

  return (
    <div className="soc-layout">
      <aside className="soc-sidebar">
        <h2>AI-SIIRCA</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/incidents">Incidents</Link>
          <Link to="/security-events">Security Events</Link>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </aside>

      <main className="soc-main">
        <div className="soc-header">
          <div>
            <h1>Security Incidents</h1>
            <p>Incident investigation and response management</p>
          </div>

          <button
            className="incident-refresh"
            onClick={loadIncidents}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="incident-error">
            {error}
          </div>
        )}

        <div className="incident-summary">
          <div className="incident-summary-card">
            <span>Total</span>
            <strong>{incidents.length}</strong>
          </div>

          <div className="incident-summary-card">
            <span>Critical</span>
            <strong>
              {
                incidents.filter(
                  (incident) =>
                    (incident.severity || "").toLowerCase() ===
                    "critical"
                ).length
              }
            </strong>
          </div>

          <div className="incident-summary-card">
            <span>High Risk</span>
            <strong>
              {
                incidents.filter(
                  (incident) =>
                    (incident.severity || "").toLowerCase() ===
                    "high"
                ).length
              }
            </strong>
          </div>

          <div className="incident-summary-card">
            <span>Open</span>
            <strong>
              {
                incidents.filter(
                  (incident) =>
                    (incident.status || "").toLowerCase() !==
                    "resolved"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="incident-table-panel">
          <div className="incident-table-header">
            <div>
              <h2>Incident Queue</h2>
              <p>
                Security incidents requiring analyst investigation
              </p>
            </div>
          </div>

          {loading ? (
            <div className="incident-empty">
              Loading incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div className="incident-empty">
              No security incidents found.
            </div>
          ) : (
            <div className="incident-table-wrapper">
              <table className="incident-table">
                <thead>
                  <tr>
                    <th>Incident</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Risk Score</th>
                    <th>Events</th>
                    <th>Source IP</th>
                    <th>User</th>
                  </tr>
                </thead>

                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <Link
  to={`/incidents/${incident.id}`}
  className="incident-link"
>
  {incident.incident_key}
</Link>
                        <span className="incident-title">
                          {incident.title}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`severity-badge ${getSeverityClass(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>
                      </td>

                      <td>
                        <strong>{incident.risk_score}</strong>
                        <span className="risk-label">/ 100</span>
                      </td>

                      <td>{incident.event_count || 0}</td>

                      <td>
                        {incident.primary_source_ip || "-"}
                      </td>

                      <td>
                        {incident.primary_user || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Link to="/dashboard" className="incident-back">
          ← Back to SOC Dashboard
        </Link>
      </main>
    </div>
  );
}

export default IncidentDashboard;