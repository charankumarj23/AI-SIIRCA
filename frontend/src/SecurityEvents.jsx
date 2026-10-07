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
      setError("Failed to load security events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getSeverityClass = (severity) => {
    if (severity === "high") return "severity-high";
    if (severity === "medium") return "severity-medium";
    if (severity === "low") return "severity-low";
    return "severity-default";
  };

  return (
    <div className="app">
      <h1>Security Events</h1>

      <button onClick={loadEvents} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh Events"}
      </button>

      {error && <p>{error}</p>}

      {!loading && events.length === 0 && !error && (
        <p>No security events found.</p>
      )}

      {events.length > 0 && (
        <div style={{ width: "95%", maxWidth: "1200px", marginTop: "25px", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
            }}
          >
            <thead>
              <tr>
                <th style={headerStyle}>Type</th>
                <th style={headerStyle}>Source</th>
                <th style={headerStyle}>Source IP</th>
                <th style={headerStyle}>Username</th>
                <th style={headerStyle}>Severity</th>
                <th style={headerStyle}>Message</th>
                <th style={headerStyle}>Time</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td style={cellStyle}>{event.event_type}</td>
                  <td style={cellStyle}>{event.source || "-"}</td>
                  <td style={cellStyle}>{event.source_ip || "-"}</td>
                  <td style={cellStyle}>{event.username || "-"}</td>
                  <td style={cellStyle}>
                    <span className={getSeverityClass(event.severity)}>
                      {event.severity}
                    </span>
                  </td>
                  <td style={cellStyle}>{event.message || "-"}</td>
                  <td style={cellStyle}>
                    {new Date(event.event_timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link to="/dashboard" style={{ marginTop: "25px" }}>
        Back to Dashboard
      </Link>
    </div>
  );
}

const headerStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
  background: "#f1f5f9",
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
};

export default SecurityEvents;