const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); // body-parser yerine bu yeterli

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

app.post("/chat", (req, res) => {
  const msg = req.body.message;

  if (!msg) {
    return res.json({ reply: "Mesaj gelmedi" });
  }

  res.json({
    reply: "Mesaj alındı: " + msg
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor, port:", PORT);
});
