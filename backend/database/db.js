require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: 5432,
  database: "ai_siirca",
  user: "postgres",
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
