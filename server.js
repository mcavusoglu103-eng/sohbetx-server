app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message || "";
    // burada cevabı üret (OpenAI veya basit mantık)
    const reply = userMessage ? `Echo: ${userMessage}` : "Mesaj boş.";

    return res.json({ reply });   // ÖNEMLİ: her zaman JSON
  } catch (e) {
    return res.status(500).json({ reply: "Cevap alınamadı." });
  }
});
