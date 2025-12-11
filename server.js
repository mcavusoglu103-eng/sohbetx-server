const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Basit test endpoint
app.get("/", (req, res) => {
  res.send("SohbetX backend çalışıyor");
});

// AI test endpoint
app.post("/chat", async (req, res) => {
  const userText = req.body.message || "";
  const reply = "SohbetX (fake AI): " + userText;
  res.json({ reply });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
