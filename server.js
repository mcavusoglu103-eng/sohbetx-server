const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Basit, RAM içi kullanıcı veritabanı
// Gerçekte MongoDB vs. ile değiştireceğiz.
const users = {};
// users[username] = { username, password, vip, coins, createdAt }

function hashPassword(pass) {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

// Basit admin "şifresi" (gerçekte .env ile saklanmalı)
const ADMIN_KEY = "SUPERADMIN123";

// Kayıt
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

// Giriş
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

// Kullanıcı bilgisi (profil)
app.get("/me/:username", (req, res) => {
  const u = users[req.params.username];
  if (!u) return res.json({ ok: false, msg: "Kullanıcı yok." });

  return res.json({
    ok: true,
    user: {
      username: u.username,
      vip: u.vip,
      coins: u.coins,
      createdAt: u.createdAt,
    },
  });
});

// ADMIN: jeton ekle
app.post("/admin/addCoins", (req, res) => {
  const { adminKey, username, amount } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ ok: false, msg: "Yetkisiz." });
  }

  const u = users[username];
  if (!u) return res.json({ ok: false, msg: "Kullanıcı yok." });

  const amt = Number(amount) || 0;
  if (amt <= 0) return res.json({ ok: false, msg: "Tutar geçersiz." });

  u.coins += amt;

  return res.json({
    ok: true,
    msg: `Kullanıcıya ${amt} jeton eklendi.`,
    coins: u.coins,
  });
});

// ADMIN: VIP aç/kapat
app.post("/admin/setVip", (req, res) => {
  const { adminKey, username, vip } = req.body;

  if (adminKey !== ADMIN_KEY) {
    return res.status(403).json({ ok: false, msg: "Yetkisiz." });
  }

  const u = users[username];
  if (!u) return res.json({ ok: false, msg: "Kullanıcı yok." });

  u.vip = !!vip;

  return res.json({
    ok: true,
    msg: `VIP durumu güncellendi: ${u.vip}`,
    vip: u.vip,
  });
});

// Kullanıcı: jeton harcama
app.post("/spendCoins", (req, res) => {
  const { username, amount } = req.body;
  const u = users[username];

  if (!u) return res.json({ ok: false, msg: "Kullanıcı yok." });

  const amt = Number(amount) || 0;
  if (amt <= 0) return res.json({ ok: false, msg: "Tutar geçersiz." });

  if (u.coins < amt) {
    return res.json({ ok: false, msg: "Yetersiz jeton." });
  }

  u.coins -= amt;

  return res.json({
    ok: true,
    msg: "Jeton harcandı.",
    coins: u.coins,
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
    // data: { roomId, from, text, highlight? }
    const u = users[data.from];
    const isVip = u ? u.vip : false;

    const payload = {
      from: data.from,
      text: data.text,
      time: Date.now(),
      vip: isVip,
      highlight: !!data.highlight,
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
