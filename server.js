import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const VERSION = "v3-18-12-AAA"; // bunu her seferinde değiştir

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor " + VERSION);
});

app.post("/chat", (req, res) => {
  const message = req.body?.message ?? "";
  res.json({ reply: "Merhaba! Nasıl yardımcı olabilirim? (" + VERSION + "): " + message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("running", PORT, VERSION));
