const express = require("express");

const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const app = express();
const http = require("http").Server(app);

const sharedsession = require("express-socket.io-session");
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});

let io = require("socket.io")(http);

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));

const players = [];
const game = [];

// Attach session
app.use(session);

// Share session with io sockets
io.use(
  sharedsession(session, {
    autoSave: true
  })
);

app.use("/index", (req, res) => {
  res.render("../views/pages/index.ejs");
});

app.use("/login", (req, res) => {
  req.session.user = {
    username: req.query.username
  };
  res.redirect("/room-choice");
});

app.use("/room-choice", (req, res) => {
  res.render("../views/pages/join-room.ejs");
});

app.use("/join-room", (req, res) => {
  req.session.user.roomId = req.query.roomId;
  res.redirect("/game");
});

app.use("/game", (req, res) => {
  console.log(req.session.user);
  const user = req.session.user;
  players.push(user);
  console.log(players);
  res.render("../views/pages/game.ejs", {
    username: user.username,
    roomId: user.roomId
  });
});

// Unset session data via express request
app.use("/logout", (req, res) => {
  delete req.session.user;
  //req.session.save();
  res.redirect("/");
});

io.on("connection", socket => {
  socket.emit("sessiondata", socket.handshake.session);
  const user = socket.handshake.session.user;
  if (user) {
    if ("roomId" in user) {
      const roomId = user["roomId"];
      socket.join(roomId);
      io.sockets.in(user.roomId).emit("roomId", user);
    }
  }

  socket.on("checkPlayersInRoom", roomId => {
    // check wie nog meer dit room id heeft en stuur terug
    io.of("/")
      .in(roomId)
      .clients((error, clients) => {
        io.sockets.in(roomId).emit("players", players);
      });
    if (players.length > 1) {
      getDog(roomId);
    }
  });

  // players.push(socket.id);

  // Unset session data via socket
  socket.on("checksession", () => {
    socket.emit("checksession", socket.handshake.session);
  });
  // Unset session data via socket
  socket.on("logout", () => {
    delete socket.handshake.session.user;
    socket.emit("logged_out", socket.handshake.session);
  });
});

async function getDog(room) {
  let response = await fetch("https://dog.ceo/api/breeds/image/random");
  let dog = await response.json();
  let dogUrl = dog.message;

  const points = getPoints();
  const card = { image: dogUrl, points: points };
  game.push(card);
  console.log(game);
  io.sockets.in(room).emit("dog", card);
}

function getPoints() {
  const min = 10;
  const max = 100;
  const points = Math.floor(Math.random() * (max - min + 1) + min);
  return points;
}
http.listen(port, () => console.log(`Example app listening on port ${port}!`));
