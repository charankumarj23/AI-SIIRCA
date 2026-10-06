const express = require("express");
const cors = require("cors");
require("dotenv").config();

const usersRoutes = require("./routes/users");
const protectedRoutes = require("./routes/protected");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI-SIIRCA Backend is running" });
});

app.use("/api/users", usersRoutes);
app.use("/api/protected", protectedRoutes);

app.listen(PORT, () => {
  console.log(`AI-SIIRCA backend running on port ${PORT}`);
});
