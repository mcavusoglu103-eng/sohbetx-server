const users = {}; // Geçici bellek (MongoDB ekleyince burayı değiştiririz)
const crypto = require("crypto");

// Basit şifreleme
function hashPassword(pass) {
  return crypto.createHash("sha256").update(pass).digest("hex");
}

// Kayıt
app.post("/register", express.json(), (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ ok: false, msg: "Eksik bilgi" });

  if (users[username])
    return res.json({ ok: false, msg: "Bu kullanıcı zaten var." });

  users[username] = {
    username,
    password: hashPassword(password),
    vip: false,
    coins: 0,
  };

  res.json({ ok: true, msg: "Kayıt başarılı" });
});

// Giriş
app.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;

  if (!users[username])
    return res.json({ ok: false, msg: "Kullanıcı yok" });

  if (users[username].password !== hashPassword(password))
    return res.json({ ok: false, msg: "Şifre yanlış" });

  res.json({
    ok: true,
    user: users[username],
  });
});


const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

app.use(cors());

// public klasörünü statik servis et
app.use(express.static(path.join(__dirname, "public")));

// Sağlık kontrolü
app.get("/api", (req, res) => {
  res.send("SohbetX sunucu çalışıyor.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
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
      time: Date.now()
    };
    io.to(data.roomId).emit("receiveMessage", payload);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("SohbetX server port:", PORT);
});
