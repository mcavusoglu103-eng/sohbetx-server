
app.use(express.static("public"));
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

// Basit kontrol endpoint'i
app.get("/", (req, res) => {
  res.send("SohbetX sunucu çalışıyor.");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Kullanıcı bağlandığında
io.on("connection", (socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  // Oda katılma
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} oda ${roomId} içine girdi`);
  });

  // Mesaj gönderme
  socket.on("sendMessage", (data) => {
    // data: { roomId, from, text }
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
