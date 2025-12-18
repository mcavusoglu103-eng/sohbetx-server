import express from "express";
import cors from "cors";

const app = express();
const VERSION = "v3-18-12-AAA";

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor " + VERSION);
});

// Chat endpoint
app.post("/chat", (req, res) => {
  const message = (req.body?.message ?? "").toString().trim();

  if (!message) {
    return res.json({ reply: "Lütfen bir mesaj yaz." });
  }

  if (message.toLowerCase().includes("merhaba")) {
    return res.json({
      reply: "Merhaba! Nasıl yardımcı olabilirim?"
    });
  }

  return res.json({
    reply: "Mesajını aldım: " + message
  });
});

// Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("SohbetX API çalışıyor:", VERSION, "PORT:", PORT);
});
