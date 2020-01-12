console.log("start");

require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
var cookieParser = require("cookie-parser");

const app = express();
var http = require("http").Server(app);
const port = process.env.PORT || 3000;
var bodyParser = require("body-parser");

let ejs = require("ejs");
let io = require("socket.io")(http);

app.use(cookieParser());
app.use(express.static("static"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});
const sharedsession = require("express-socket.io-session");

// Attach session
app.use(session);

// Use shared session middleware for socket.io
// setting autoSave:true
io.use(
  sharedsession(session, {
    autoSave: true
  })
);

app.use("*", function(req, res, next) {
  console.log(req.session);
  // next();
});

io.use(function(socket, next) {
  console.log(socket.handshake.session);
  // next();
});

app.use("/login", function(req, res, next) {
  debug("Requested /login");
  req.session.user = {
    username: "OSK"
  };
  //req.session.save();
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.render("../views/pages/registration.ejs");
  console.log(req.session);
});

app.get("/index", (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.render("../views/pages/index.ejs");
  }
});

io.sockets.on("connection", function(socket) {
  socket.on("createUser", function(user) {
    console.log(user);
    socket.handshake.session.user = user;
    socket.handshake.session.save();

    var destination = "/index";

    console.log(destination);
    io.emit("redirect", destination);

    // const room = user.room;
    // socket.join(room);
    // console.log(socket);
    // io.sockets.in(room).emit("roomId", room);
    // players.push(user);

    // io.of("/")
    //   .in(room)
    //   .clients((error, clients) => {
    //     io.sockets.in(room).emit("players", players);
    //   });
    // if (players.length > 1) {
    //   getDog(room);
    // }
  });
  socket.on("disconnect", function(user) {
    console.log(user);
    // if (socket.handshake.session.user) {
    //   delete socket.handshake.session.user;
    //   socket.handshake.session.save();
    // }
  });
});

const players = [];
let game = [];
const currentDog = [];

// io.sockets.on("connection", function(socket) {
//   socket.on("disconnect", function() {
//     // console.log("Got disconnect!");
//     var i = players.indexOf(socket.id);
//     players.splice(i, 1);
//   });
//   socket.on("createUser", function(user) {
//     const id = socket.id;
//     const room = user.room;
//     socket.join(room);
//     io.sockets.in(room).emit("roomId", room);
//     players.push(user);

//     io.of("/")
//       .in(room)
//       .clients((error, clients) => {
//         io.sockets.in(room).emit("players", players);
//       });
//     if (players.length > 1) {
//       getDog(room);
//     }
//   });

//   async function getDog(room) {
//     let response = await fetch("https://dog.ceo/api/breeds/image/random");
//     let dog = await response.json();
//     let dogUrl = dog.message;

//     const points = getPoints();
//     const card = { image: dogUrl, points: points };
//     game.push(card);
//     console.log(game);
//     io.sockets.in(room).emit("dog", card);
//   }

// socket.on("bid", function(bid) {
//   console.log(bid);
//   const user = players.find(player => player.id === socket.id);
//   user.bid.value = bid;
//   const allAnswers = players.every(player => player.bid.value != 0);
//   const answers = players.map(player => player.bid.value);
//   const tie = Object.is(answers[0], answers[1]);

//   if (allAnswers) {
//     if (tie) {
//       console.log("gelijk gespeeld");
//     } else {
//       const winner = players.reduce((max, game) =>
//         max.bid.value > game.bid.value ? max : game
//       );
//       const loser = players.reduce((max, game) =>
//         max.bid.value < game.bid.value ? max : game
//       );

//       const currentCard = game[game.length - 1];
//       console.log(currentCard);

//       winner.game += currentCard.points;
//       console.log("WINNER", winner);
//       console.log("LOSER", loser);
//       socket.broadcast.to(loser.id).emit("message", "VERLOREN");
//       socket.broadcast.to(winner.id).emit("message", "GEWONNEN");
//       players.map(player => (player.bid.value = 0));
//       getDog(user.room);
//     }
//   } else {
//     console.log("nog niet allebei gereageerd");
//   }
// });
// });

// function getPoints() {
//   const min = 10;
//   const max = 100;
//   const points = Math.floor(Math.random() * (max - min + 1) + min);
//   return points;
// }

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
