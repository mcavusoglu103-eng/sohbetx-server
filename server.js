const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const GEMINI_KEY = (process.env.GEMINI_API_KEY || "").trim();

if (!GEMINI_KEY) {
  console.error("ENV HATASI: GEMINI_API_KEY yok.");
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

app.get("/", (req, res) => res.send("OK - Server çalışıyor"));
app.get("/health", (req, res) =>
  res.json({ ok: true, hasKey: Boolean(GEMINI_KEY) })
);

// OpenAI'deki messages yapısı yerine, senin mevcut programına uyumlu olacak şekilde
// history'yi metne çevirip prompt'a ekliyoruz.
function historyToText(history) {
  if (!history) return "";
  if (typeof history === "string") return history;

  if (Array.isArray(history)) {
    return history
      .map((x) => {
        if (typeof x === "string") return x;
        if (x && typeof x === "object") {
          const role = x.role || "unknown";
          const content = x.content || "";
          return `\n${role}: ${content}`;
        }
        return "";
      })
      .join("");
  }
  return "";
}

app.post("/chat", async (req, res) => {
  try {
    const message = (req.body?.message || "").toString().trim();
    const history = req.body?.history;

    if (!message) return res.status(400).json({ reply: "Mesaj boş." });
    if (!GEMINI_KEY) {
      return res
        .status(500)
        .json({ reply: "GEMINI_API_KEY tanımlı değil (Environment)." });
    }

    const histText = historyToText(history);
    const prompt = `${histText}\nSen: ${message}\nBot:`;

    // Ücretsiz / hızlı model
   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "Cevap üretilemedi.";

    return res.json({ reply: text });
  } catch (err) {
    console.error("Hata:", err);
    return res.status(500).json({
      reply: "HATA: " + String(err?.message || err),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
