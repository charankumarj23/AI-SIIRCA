import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function SecurityEvents() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
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
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="app">
      <h1>Security Events</h1>

      {error && <p>{error}</p>}

      {events.length === 0 && !error && (
        <p>No security events found.</p>
      )}

      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.event_type}</h3>
          <p>Source: {event.source}</p>
          <p>Source IP: {event.source_ip}</p>
          <p>Username: {event.username}</p>
          <p>Severity: {event.severity}</p>
          <p>Message: {event.message}</p>
          <p>Time: {event.event_timestamp}</p>
          <hr />
        </div>
      ))}

      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export default SecurityEvents;
