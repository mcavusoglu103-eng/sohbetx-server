// server.js
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// Render'da KEY'i "SohbetX" yapmışsın. İstersen GEMINI_API_KEY de destekli.
// Önce GEMINI_API_KEY varsa onu alır, yoksa SohbetX'i alır.
const API_KEY = process.env.GEMINI_API_KEY || process.env.SohbetX;

if (!API_KEY) {
  console.error("API KEY bulunamadı. Render Environment'a GEMINI_API_KEY veya SohbetX ekle.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Root route: tarayıcıda "Cannot GET /" görmemek için
app.get("/", (req, res) => {
  res.status(200).send("OK - Server çalışıyor");
});

// Sağlık kontrolü için
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// App Inventor / istemci buraya POST atacak
// Body: { "message": "..." } veya { "prompt": "..." }
app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body?.message || req.body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ reply: "mesaj boş" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";

    return res.json({ reply: text || "Boş yanıt döndü." });
  } catch (error) {
    console.error("Hata:", error);
    return res.status(500).json({ reply: "Yapay zeka şu an cevap veremiyor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
