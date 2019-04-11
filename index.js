console.log("test");

require("dotenv").config();

const express = require("express");
const app = express();
var http = require("http").Server(app);
const port = process.env.PORT || 3000;
let emoji = require("node-emoji");
let ejs = require("ejs");
let io = require("socket.io")(http);

app.use(express.static("static"));

app.get("/", (req, res) => res.render("../views/pages/index.ejs"));

io.on("connection", socket => {
  var msgCount = [];
  socket.on("chat message", msg => {
    var msg = msg.split(" ").map(word => {
      msgCount++;
      return emoji.get(word) || word;
    });
    console.log(msgCount);

    var msg = msg
      .toString()
      .replace(/,/g, " ")
      .replace(/:/g, "");

    io.emit("chat message", msg, msgCount);
  });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
