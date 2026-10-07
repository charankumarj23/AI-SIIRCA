import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
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
        error.response?.data?.error || "Failed to load incidents"
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

  const highRiskCount = incidents.filter(
    (incident) =>
      (incident.severity || "").toLowerCase() === "high"
  ).length;

  const activeCount = incidents.filter(
    (incident) =>
      (incident.status || "").toLowerCase() !== "resolved"
  ).length;

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
            <h1>Security Operations Center</h1>
            <p>AI-Assisted Security Incident Investigation</p>
          </div>

          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
        </div>

        {error && <p className="dashboard-error">{error}</p>}

        <div className="soc-cards">
          <div className="soc-card">
            <span>Total Incidents</span>
            <strong>{loading ? "--" : totalIncidents}</strong>
          </div>

          <div className="soc-card">
            <span>Critical</span>
            <strong>{loading ? "--" : criticalCount}</strong>
          </div>

          <div className="soc-card">
            <span>High Risk</span>
            <strong>{loading ? "--" : highRiskCount}</strong>
          </div>

          <div className="soc-card">
            <span>Active Investigations</span>
            <strong>{loading ? "--" : activeCount}</strong>
          </div>
        </div>

        <div className="soc-panel">
          <h2>Incident Investigation</h2>

          <p>
            Investigate security incidents using timeline reconstruction,
            attack relationships, root-cause analysis and AI investigation
            guidance.
          </p>

          <Link to="/incidents" className="soc-action">
            Open Incident Dashboard
          </Link>
        </div>
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