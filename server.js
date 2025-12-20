const express = require("express");
const OpenAI = require("openai");

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

// Eski env adını da destekleyelim (SohbetX) + yeni standart (OPENAI_API_KEY)
const OPENAI_KEY = (process.env.OPENAI_API_KEY || "").trim();

if (!OPENAI_KEY) {
  console.error("ENV HATASI: SohbetX veya OPENAI_API_KEY yok.");
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });

app.get("/", (req, res) => res.send("OK - Server çalışıyor"));
app.get("/health", (req, res) =>
  res.json({ ok: true, hasKey: Boolean(OPENAI_KEY) })
);

/**
 * history -> OpenAI messages formatı
 * Desteklenen history:
 * 1) string: içinde "Sen:" ve "Bot:" satırları olabilir
 * 2) array: ["Sen: ...", "Bot: ..."] gibi stringler veya {role, content} objeleri
 */
function historyToMessages(history) {
  const messages = [];

  const pushRole = (role, content) => {
    const text = (content || "").toString().trim();
    if (!text) return;
    if (role !== "user" && role !== "assistant" && role !== "system") role = "system";
    messages.push({ role, content: text });
  };

  const parseSenBotLines = (text) => {
    // "Sen:" ve "Bot:" geçen satırları ayrıştır
    // Eğer format çok karışıksa, komple system context olarak gönderir.
    const lines = text.split("\n");
    let anyMatched = false;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      if (line.toLowerCase().startsWith("sen:")) {
        anyMatched = true;
        pushRole("user", line.slice(4).trim());
      } else if (line.toLowerCase().startsWith("bot:")) {
        anyMatched = true;
        pushRole("assistant", line.slice(4).trim());
      } else {
        // Format dışı satırlar: eğer hiç eşleşme yoksa bunları systeme toplayacağız
        // ama eşleşme varsa bunları "system" olarak eklemek yerine atlayalım (gürültüyü azaltır)
        // İstersen burayı systeme de ekleyebilirim.
      }
    }

    if (!anyMatched) {
      // Hiç Sen/Bot yakalanmadıysa tamamını context yap
      pushRole("system", `Önceki konuşma:\n${text}`);
    }
  };

  if (!history) return messages;

  if (typeof history === "string") {
    parseSenBotLines(history);
    return messages;
  }

  if (Array.isArray(history)) {
    for (const x of history) {
      if (typeof x === "string") {
        parseSenBotLines(x);
      } else if (x && typeof x === "object") {
        // role normalize
        const r = (x.role || "").toLowerCase();
        const role =
          r === "assistant" || r === "bot"
            ? "assistant"
            : r === "user" || r === "sen"
            ? "user"
            : r === "system"
            ? "system"
            : "system";
        pushRole(role, x.content);
      }
    }
  }

  return messages;
}

app.post("/chat", async (req, res) => {
  try {
    const message = (req.body?.message || "").toString().trim();
    const history = req.body?.history; // opsiyonel

    if (!message) return res.status(400).json({ reply: "Mesaj boş." });
    if (!OPENAI_KEY) {
      return res.status(500).json({ reply: "API anahtarı tanımlı değil (Environment)." });
    }

    const messages = historyToMessages(history);
    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const text =
      completion?.choices?.[0]?.message?.content?.trim() || "Cevap üretilemedi.";

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
