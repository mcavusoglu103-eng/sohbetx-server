import express from "express";
import cors from "cors";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health / test
app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

// Chat endpoint
app.post("/chat", (req, res) => {
  const message = (req.body && req.body.message) ? String(req.body.message) : "";

  if (!message.trim()) {
    return res.status(400).json({ reply: "Mesaj boş olamaz." });
  }

  return res.json({
    reply: "Mesaj alındı: " + message
  });
});

// Render uses PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Sunucu", PORT, "numaralı portta çalışıyor");
});
