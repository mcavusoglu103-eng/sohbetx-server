const express = require("express");
const cors = require("cors");

const app = express();

// App Inventor'un gönderdiği text'i alabilmek için:
app.use(cors());
app.use(express.text({ type: "*/*" }));

// Test endpoint
app.get("/", (req, res) => {
  res.send("SohbetX server çalışıyor");
});

// App Inventor -> Web.PostText buraya POST atacak
app.post("/chat", (req, res) => {
  const userMessage = (req.body || "").toString().toLowerCase().trim();

  let reply;

  if (!userMessage) {
    reply = "Merhaba, ben SohbetX Asistanıyım. Bir şey yaz, cevap vereyim.";
  } else if (userMessage.includes("merhaba")) {
    reply = "Merhaba! Nasılsın?";
  } else if (userMessage.includes("kimsin")) {
    reply = "Ben SohbetX Asistanıyım.";
  } else if (userMessage.includes("nasılsın")) {
    reply = "İyiyim, teşekkür ederim. Sen nasılsın?";
  } else {
    reply = "Henüz sınırlı cevap verebiliyorum. 'merhaba', 'kimsin', 'nasılsın' deneyebilirsin.";
  }

  res.send(reply); // JSON YOK, tylko düz text gönderiyoruz!
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log("Server çalışıyor, port:", port);
});
