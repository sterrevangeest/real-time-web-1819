const express = require("express");

const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const sharedsession = require("express-socket.io-session");
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});

app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));

const players = [];
const cards = [];
const step = [];

// Attach session
app.use(session);

// Share session with io sockets
io.use(
  sharedsession(session, {
    autoSave: true
  })
);
const game = require("./game.js");
const routes = require("./routes.js").routes(app);

io.on("connection", socket => {
  socket.emit("sessiondata", socket.handshake.session);
  const user = socket.handshake.session.user;
  user.id = socket.id;
  user.bid = 0;
  players.push(user);
  if (user) {
    if ("roomId" in user) {
      const roomId = user["roomId"];
      socket.join(roomId);
      // io.sockets.in(user.roomId).emit("roomId", user);
      io.of("/")
        .in(roomId)
        .clients((error, clients) => {
          io.sockets.in(roomId).emit("players", players);
        });
      if (players.length > 1) {
        // start game
        startGame(roomId);
      }
    }
  }

  socket.on("bid", function(bid) {
    const currentUser = players.find(
      player => player.username === user.username
    );
    currentUser.bid = bid;
    const allAnswers = players.every(player => player.bid != 0);
    console.log(allAnswers);
    if (allAnswers) {
      const result = game.getResult(players, cards);
      console.log("Result", result);
      players.map(player => (player.bid = 0));
      startGame(user.roomId);
      io.of("/")
        .in(user.roomId)
        .clients((error, clients) => {
          io.sockets.in(user.roomId).emit("message", result);
        });
    }
    // socket.broadcast.to(loser.id).emit("message", "verloren");
    // socket.broadcast.to(winner.id).emit("message", "gewonnen");
  });

  function startGame(roomId) {
    game.getCard().then(card => {
      cards.push(card);
      io.sockets.in(roomId).emit("sendCard", card);
      step.push("card");
      console.log(step);
      if (step.length > 4) {
        console.log("laat eindresultaat zien");
      }
    });
  }

  // Unset session data via socket
  socket.on("logout", () => {
    delete socket.handshake.session.user;
    socket.emit("logged_out", socket.handshake.session);
  });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
