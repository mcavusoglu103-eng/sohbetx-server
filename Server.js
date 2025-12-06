const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

const app = express();

app.use(cors());

// public klasörünü statik servis et
app.use(express.static(path.join(__dirname, "public")));

// İstersen sağlık kontrolü için ayrı endpoint
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
