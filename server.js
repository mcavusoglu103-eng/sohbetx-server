import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SohbetX API çalışıyor");
});

app.post("/chat", (req, res) => {
  const message = req.body.message?.toLowerCase() || "";
  let reply = "Tam anlayamadım, biraz daha açık yazar mısın?";

  if (message.includes("merhaba") || message.includes("selam")) {
    reply = "Merhaba! Sana nasıl yardımcı olabilirim?";
  } 
  else if (message.includes("nasılsın")) {
    reply = "İyiyim teşekkür ederim. Sen nasılsın?";
  } 
  else if (message.includes("kimsin")) {
    reply = "Ben SohbetX Asistanıyım.";
  } 
  else if (message.includes("teşekkür")) {
    reply = "Rica ederim 🙂";
  }

  res.json({ reply: reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
