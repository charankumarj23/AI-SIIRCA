const express = require("express");
const authenticateToken = require("../middleware/auth");
const authorizeRole = require("../middleware/role");

const router = express.Router();

router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

router.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({
    message: "Admin access granted",
    user: req.user
  });
});

module.exports = router;