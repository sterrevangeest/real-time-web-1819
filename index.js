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

const allPlayers = [];
const allRooms = [];
const cards = [];

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
  // create user
  const user = socket.handshake.session.user;
  user.id = socket.id;
  user.bid = 0;
  user.game = 0;
  allPlayers.push(user);

  if (user) {
    if ("roomId" in user) {
      const roomId = user["roomId"];
      socket.join(roomId);

      let fellowPlayers = allPlayers.filter(player => player.roomId === roomId);
      io.sockets.in(roomId).emit("players", fellowPlayers);

      if (fellowPlayers.length > 1) {
        startGame(roomId);
        var key = roomId;
        var obj = {};
        obj[key] = fellowPlayers;
        allRooms.push(obj);
      }
    }
  }

  socket.on("bid", bid => {
    // save bid in user object
    user.bid = bid;

    // show bid of opponent to client
    let fellowPlayers = game.getFellowPlayers(user, allRooms);
    const allAnswers = fellowPlayers.every(player => player.bid != 0);
    if (allAnswers) {
      fellowPlayers.map(player => {
        if (player.username != user.username) {
          const opponentBid = player.bid;
          io.sockets.in(user.id).emit("opponentBid", opponentBid);
          io.sockets.in(player.id).emit("opponentBid", user.bid);
        }
      });

      // get results and send them to client
      const result = game.getResult(fellowPlayers, cards);
      io.sockets.in(user.roomId).emit("message", result);

      // reset
      fellowPlayers.map(player => (player.bid = 0));

      // show next card
      setTimeout(function() {
        startGame(user.roomId);
      }, 5000);
    }
  });

  socket.on("endOfGame", () => {
    let fellowPlayers = game.getFellowPlayers(user, allRooms);

    const winner = game.getEndResult(fellowPlayers);

    if (winner.length > 1) {
      io.sockets.in(user.id).emit("endResult", "Gelijkspel...");
    } else {
      const loser = fellowPlayers.find(player => player.id != winner.id);
      io.sockets.in(winner.id).emit("endResult", "Wohoo! Je hebt gewonnen!");
      io.sockets.in(loser.id).emit("endResult", "Helaas, je hebt verloren...");
    }
  });

  socket.on("redirect", () => {
    resetData();
  });

  // Unset session data via socket
  socket.on("disconnect", () => {
    resetData();
  });

  function resetData() {
    // delete room
    for (rooms in allRooms) {
      delete allRooms[rooms][user.roomId];
    }

    // reset socket user
    delete socket.handshake.session.user;
  }

  function startGame(roomId) {
    game.getCard().then(card => {
      cards.push(card);
      io.sockets.in(roomId).emit("sendCard", card);
    });
  }
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
