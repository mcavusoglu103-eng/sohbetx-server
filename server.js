const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json()); // JSON body okumak için
app.use(express.static(path.join(__dirname, "public")));

// Geçici kullanıcı veritabanı (şimdilik RAM'de)
const users = {}; 
// Yapı:
// users["Muhammed"] = { username: "Muhammed", password: "hash", vip: false, coins: 0 };

function hashPassword(pass) {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

// Kayıt endpoint'i
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ ok: false, msg: "Kullanıcı adı ve şifre gerekli." });
  }

  if (users[username]) {
    return res.json({ ok: false, msg: "Bu kullanıcı zaten kayıtlı." });
  }

  users[username] = {
    username,
    password: hashPassword(password),
    vip: false,
    coins: 0,
    createdAt: Date.now(),
  };

  return res.json({ ok: true, msg: "Kayıt başarılı." });
});

// Giriş endpoint'i
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ ok: false, msg: "Kullanıcı adı ve şifre gerekli." });
  }

  const user = users[username];
  if (!user) {
    return res.json({ ok: false, msg: "Kullanıcı bulunamadı." });
  }

  if (user.password !== hashPassword(password)) {
    return res.json({ ok: false, msg: "Şifre hatalı." });
  }

  // Şimdilik sadece kullanıcı bilgisi dönüyoruz
  return res.json({
    ok: true,
    msg: "Giriş başarılı.",
    user: {
      username: user.username,
      vip: user.vip,
      coins: user.coins,
    },
  });
});

// Sağlık kontrolü
app.get("/api", (req, res) => {
  res.send("SohbetX sunucu çalışıyor.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} oda ${roomId} içine girdi`);
  });

  socket.on("sendMessage", (data) => {
    const payload = {
      from: data.from,
      text: data.text,
      time: Date.now(),
    };
    io.to(data.roomId).emit("receiveMessage", payload);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || process.env.PORT0 || 10000;
server.listen(PORT, () => {
  console.log("SohbetX server port:", PORT);
});
