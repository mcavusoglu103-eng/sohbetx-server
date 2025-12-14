const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

app.post("/chat", (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.json({ reply: "Mesaj alınamadı" });
  }

  let reply = "Tam anlayamadım";

  if (message.toLowerCase().includes("merhaba")) {
    reply = "Merhaba! Sana nasıl yardımcı olabilirim?";
  } else if (message.toLowerCase().includes("nasılsın")) {
    reply = "İyiyim teşekkür ederim, sen nasılsın?";
  }

  res.json({
    reply: reply
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
