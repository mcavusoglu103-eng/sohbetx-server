const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

app.use(express.json());

// Render panelinde 'SohbetX' olarak kaydettiğin için bu ismi kullanıyoruz
const genAI = new GoogleGenerativeAI(process.env.SohbetX); 

app.post('/chat', async (req, res) => {
    try {
        // App Inventor'dan gelen "message" verisini alır
        const prompt = req.body.message; 
        
        if (!prompt) return res.status(400).json({ reply: "Mesaj boş!" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // App Inventor'a "reply" anahtarı ile yanıt döner
        res.json({ reply: text }); 
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ reply: "Yapay zeka şu an cevap veremiyor." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
