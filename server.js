
app.post("/chat", (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.json({
      reply: "Mesaj gelmedi"
    });
  }

  const replyText = "Mesaj alındı: " + message;

  res.json({
    reply: replyText
  });
});
