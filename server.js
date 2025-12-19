const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: "1mb" }));

const GEMINI_KEY = process.env.SohbetX || process.env.GEMINI_API_KEY;

if (!GEMINI_KEY) {
  console.error("ENV HATASI: SohbetX veya GEMINI_API_KEY yok.");
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY || "");

app.get("/", (req, res) => res.send("OK - Server çalışıyor"));
app.get("/health", (req, res) => res.json({ ok: true, hasKey: Boolean(GEMINI_KEY) }));

function buildPrompt(message, history) {
  // history beklenen format: ["\nSen: ...", "\nBot: ..."] gibi string join’ler olabilir
  // veya [{role:"user",content:"..."}, ...] gibi objeler olabilir.
  // Senin bloklarında history string birikiyor, o yüzden stringse direkt kullanıyoruz.

  let histText = "";
  if (Array.isArray(history)) {
    // Eğer listeyse elemanları metne çevir
    histText = history.map(x => {
      if (typeof x === "string") return x;
      if (x && typeof x === "object") {
        const role = x.role || "unknown";
        const content = x.content || "";
        return `\n${role}: ${content}`;
      }
      return "";
    }).join("");
  } else if (typeof history === "string") {
    histText = history;
  }

  // Son mesajı en sona ekle
  return `${histText}\nSen: ${message}\nBot:`;
}

app.post("/chat", async (req, res) => {
  try {
    const message = (req.body?.message || "").toString().trim();
    const history = req.body?.history; // opsiyonel

    if (!message) return res.status(400).json({ reply: "Mesaj boş." });
    if (!GEMINI_KEY) {
      return res.status(500).json({ reply: "API anahtarı tanımlı değil (Render Environment)." });
    }

    const prompt = buildPrompt(message, history);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "Cevap üretilemedi.";

    return res.json({ reply: text });
 } catch (err) {
  console.error("Hata:", err);
  res.status(500).json({
    reply: "Yapay zeka şu an cevap veremiyor.",
    detail: String(err?.message || err)
  });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));


