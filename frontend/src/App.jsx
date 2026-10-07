import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import axios from "axios";
import { useEffect, useState } from "react";
import SecurityEvents from "./SecurityEvents.jsx";
import IncidentDashboard from "./IncidentDashboard.jsx";
import IncidentInvestigation from "./IncidentInvestigation.jsx";
import "./App.css";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="app">
      <h1>AI-SIIRCA</h1>

      {user ? (
        <>
          <h2>Welcome, {user.name}</h2>
          <p>Role: {user.role}</p>
          <Link to="/dashboard">Go to Dashboard</Link>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <p>
            AI-Assisted Security Incident Investigation & Root-Cause Analysis
            Platform
          </p>
          <Link to="/login">Go to Login</Link>
        </>
      )}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <h1>AI-SIIRCA Login</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      {error && <p>{error}</p>}

      <Link to="/">Back to Home</Link>
    </div>
  );
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

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
        error.response?.data?.error ||
          "Failed to load incidents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const totalIncidents = incidents.length;

  const criticalCount = incidents.filter(
    (incident) =>
      (incident.severity || "").toLowerCase() === "critical"
  ).length;

  const highCount = incidents.filter(
    (incident) =>
      (incident.severity || "").toLowerCase() === "high"
  ).length;

  const mediumCount = incidents.filter(
    (incident) =>
      (incident.severity || "").toLowerCase() === "medium"
  ).length;

  const openCount = incidents.filter(
    (incident) =>
      (incident.status || "").toLowerCase() !== "resolved"
  ).length;

  const resolvedCount = incidents.filter(
    (incident) =>
      (incident.status || "").toLowerCase() === "resolved"
  ).length;

  const maxSeverityCount = Math.max(
    criticalCount,
    highCount,
    mediumCount,
    1
  );

  const recentIncidents = incidents.slice(0, 5);
  const severityData = [
    {
      name: "Critical",
      incidents: criticalCount,
    },
    {
      name: "High",
      incidents: highCount,
    },
    {
      name: "Medium",
      incidents: mediumCount,
    },
    {
      name: "Low",
      incidents: incidents.filter(
        (incident) =>
          (incident.severity || "").toLowerCase() === "low"
      ).length,
    },
  ];
  
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
          <strong>{user?.name || "Analyst"}</strong>
          <small>{user?.role || "analyst"}</small>
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

            <h1>Threat Monitoring Dashboard</h1>

            <p>
              Real-time security incident monitoring,
              investigation and response.
            </p>
          </div>

          <div className="soc-user-badge">
            <strong>{user?.name || "Analyst"}</strong>
            <span>{user?.role || "analyst"}</span>
          </div>
        </div>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <div className="soc-cards">
          <div className="soc-card">
            <span>Total Incidents</span>
            <strong>
              {loading ? "--" : totalIncidents}
            </strong>
            <small>All detected incidents</small>
          </div>

          <div className="soc-card critical-card">
            <span>Critical</span>
            <strong>
              {loading ? "--" : criticalCount}
            </strong>
            <small>Immediate attention</small>
          </div>

          <div className="soc-card high-card">
            <span>High Risk</span>
            <strong>
              {loading ? "--" : highCount}
            </strong>
            <small>Requires investigation</small>
          </div>

          <div className="soc-card active-card">
            <span>Open Investigations</span>
            <strong>
              {loading ? "--" : openCount}
            </strong>
            <small>Currently active</small>
          </div>

          <div className="soc-card">
            <span>Resolved</span>
            <strong>
              {loading ? "--" : resolvedCount}
            </strong>
            <small>Closed incidents</small>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  THREAT OVERVIEW
                </span>
                <h2>Severity Distribution</h2>
              </div>
            </div>

            <div className="severity-chart">
              <div className="severity-row">
                <div className="severity-row-label">
                  <span>Critical</span>
                  <strong>{criticalCount}</strong>
                </div>

                <div className="severity-bar">
                  <div
                    className="severity-fill critical-fill"
                    style={{
                      width: `${
                        (criticalCount /
                          maxSeverityCount) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="severity-row">
                <div className="severity-row-label">
                  <span>High</span>
                  <strong>{highCount}</strong>
                </div>

                <div className="severity-bar">
                  <div
                    className="severity-fill high-fill"
                    style={{
                      width: `${
                        (highCount /
                          maxSeverityCount) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="severity-row">
                <div className="severity-row-label">
                  <span>Medium</span>
                  <strong>{mediumCount}</strong>
                </div>

                <div className="severity-bar">
                  <div
                    className="severity-fill medium-fill"
                    style={{
                      width: `${
                        (mediumCount /
                          maxSeverityCount) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-label">
                  LIVE STATUS
                </span>
                <h2>Investigation Health</h2>
              </div>
            </div>

            <div className="health-grid">
              <div>
                <strong>{openCount}</strong>
                <span>Open</span>
              </div>

              <div>
                <strong>{resolvedCount}</strong>
                <span>Resolved</span>
              </div>

              <div>
                <strong>{criticalCount}</strong>
                <span>Critical</span>
              </div>

              <div>
                <strong>{totalIncidents}</strong>
                <span>Total</span>
              </div>
            </div>

            <Link
              to="/incidents"
              className="dashboard-primary-action"
            >
              Open Incident Queue →
            </Link>
          </section>
        </div>

        <section className="dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                INCIDENT ACTIVITY
              </span>
              <h2>Recent Security Incidents</h2>
            </div>

            <Link to="/incidents">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="dashboard-empty">
              Loading incident activity...
            </div>
          ) : recentIncidents.length === 0 ? (
            <div className="dashboard-empty">
              No incidents detected.
            </div>
          ) : (
            <div className="recent-incidents">
              {recentIncidents.map((incident) => (
                <Link
                  key={incident.id}
                  to={`/incidents/${incident.id}`}
                  className="recent-incident"
                >
                  <div>
                    <strong>
                      {incident.incident_key}
                    </strong>

                    <span>
                      {incident.title}
                    </span>
                  </div>

                  <div className="recent-incident-meta">
                    <span>
                      {incident.primary_source_ip ||
                        "Unknown IP"}
                    </span>

                    <span>
                      Risk {incident.risk_score}/100
                    </span>

                    <span>
                      {incident.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel security-pipeline">
          <div className="panel-heading">
            <div>
              <span className="panel-label">
                DETECTION PIPELINE
              </span>
              <h2>AI-SIIRCA Security Analysis Flow</h2>
            </div>
          </div>

          <div className="pipeline">
            <span>Events</span>
            <b>→</b>
            <span>Normalize</span>
            <b>→</b>
            <span>Noise Reduction</span>
            <b>→</b>
            <span>Risk Analysis</span>
            <b>→</b>
            <span>Correlation</span>
            <b>→</b>
            <span>Incident</span>
            <b>→</b>
            <span>Investigation</span>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incidents" element={<IncidentDashboard />} />
        <Route path="/incidents/:id" element={<IncidentInvestigation />}
/>
        <Route path="/security-events" element={<SecurityEvents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;