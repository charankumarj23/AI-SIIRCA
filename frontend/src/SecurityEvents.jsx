import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function SecurityEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/security-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEvents(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Failed to load security events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getSeverityClass = (severity) => {
    const value = (severity || "").toLowerCase();

    if (value === "critical") return "event-critical";
    if (value === "high") return "event-high";
    if (value === "medium") return "event-medium";
    if (value === "low") return "event-low";

    return "event-default";
  };

  const criticalCount = events.filter(
    (event) =>
      (event.severity || "").toLowerCase() === "critical"
  ).length;

  const highCount = events.filter(
    (event) =>
      (event.severity || "").toLowerCase() === "high"
  ).length;

  const mediumCount = events.filter(
    (event) =>
      (event.severity || "").toLowerCase() === "medium"
  ).length;

  return (
    <div className="soc-layout">
      <aside className="soc-sidebar">
        <div className="sidebar-brand">
          <h2>AI-SIIRCA</h2>
          <span>SECURITY PLATFORM</span>
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/incidents">Incidents</Link>
          <Link to="/security-events">
            Security Events
          </Link>
        </nav>

        <div className="sidebar-user">
          <span>Logged in as</span>
          <strong>
            {JSON.parse(localStorage.getItem("user"))?.name ||
              "Analyst"}
          </strong>
          <small>
            {JSON.parse(localStorage.getItem("user"))?.role ||
              "analyst"}
          </small>
        </div>

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
            <span className="soc-eyebrow">
              SECURITY OPERATIONS CENTER
            </span>

            <h1>Security Events</h1>

            <p>
              Monitor, inspect and analyze incoming security
              telemetry.
            </p>
          </div>

          <button
            className="incident-refresh"
            onClick={loadEvents}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh Events"}
          </button>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="soc-cards">
          <div className="soc-card">
            <span>Total Events</span>
            <strong>
              {loading ? "--" : events.length}
            </strong>
            <small>Collected security telemetry</small>
          </div>

          <div className="soc-card critical-card">
            <span>Critical</span>
            <strong>
              {loading ? "--" : criticalCount}
            </strong>
            <small>Immediate attention</small>
          </div>

          <div className="soc-card high-card">
            <span>High</span>
            <strong>
              {loading ? "--" : highCount}
            </strong>
            <small>High-risk events</small>
          </div>

          <div className="soc-card active-card">
            <span>Medium</span>
            <strong>
              {loading ? "--" : mediumCount}
            </strong>
            <small>Requires monitoring</small>
          </div>
        </div>

        <section className="dashboard-panel security-events-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                EVENT TELEMETRY
              </span>

              <h2>Security Event Stream</h2>
            </div>

            <span className="event-count">
              {events.length} events
            </span>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading security events...
            </div>
          ) : events.length === 0 ? (
            <div className="dashboard-empty">
              No security events found.
            </div>
          ) : (
            <div className="security-events-table-wrapper">
              <table className="security-events-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Source</th>
                    <th>Source IP</th>
                    <th>Username</th>
                    <th>Severity</th>
                    <th>Risk</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <strong>
                          {event.event_type}
                        </strong>
                      </td>

                      <td>
                        {event.source || "-"}
                      </td>

                      <td>
                        <span className="event-ip">
                          {event.source_ip || "-"}
                        </span>
                      </td>

                      <td>
                        {event.username || "-"}
                      </td>

                      <td>
                        <span
                          className={`event-severity ${getSeverityClass(
                            event.severity
                          )}`}
                        >
                          {event.severity || "low"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {event.risk_score ?? 0}
                        </strong>
                        <span className="risk-label">
                          /100
                        </span>
                      </td>

                      <td className="event-message">
                        {event.message || "-"}
                      </td>

                      <td className="event-time">
                        {new Date(
                          event.event_timestamp
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <Link
          to="/dashboard"
          className="incident-back"
        >
          ← Back to SOC Dashboard
        </Link>
      </main>
    </div>
  );
}

export default SecurityEvents;