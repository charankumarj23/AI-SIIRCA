import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import SecurityEvents from "./SecurityEvents.jsx";
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
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/protected/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data.user);
    } catch (error) {
      setError("Protected API access failed");
    }
  };

  return (
    <div className="app">
      <h1>AI-SIIRCA Dashboard</h1>

      <button onClick={loadProfile}>
        Load Protected Profile
      </button>

      {profile && (
        <>
          <h2>
            Welcome, {JSON.parse(localStorage.getItem("user"))?.name}
          </h2>
          <p>Email: {profile.email}</p>
          <p>Role: {profile.role}</p>
        </>
      )}

      {error && <p>{error}</p>}

      <Link to="/security-events">View Security Events</Link>
      <Link to="/">Back to Home</Link>
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
        <Route path="/security-events" element={<SecurityEvents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
