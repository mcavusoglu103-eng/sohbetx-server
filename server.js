const express = require("express");
const cors = require("cors");

const app = express();

/* 🔴 BUNLAR ÇOK ÖNEMLİ */
app.use(cors());
app.use(express.json()); // JSON okumazsan her şey boşa gider

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

app.post("/chat", (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.json({ reply: "Mesaj gelmedi" });
  }

  // Şimdilik basit cevap
  res.json({
    reply: "Mesajın alındı: " + message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
