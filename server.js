const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

app.post("/chat", (req, res) => {
  const msg = req.body.message || "";
  res.json({ reply: "Mesaj alındı: " + msg });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor, port:", PORT);
});
