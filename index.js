console.log("test");

require("dotenv").config();

const express = require("express");
const app = express();
var http = require("http").Server(app);
const port = process.env.PORT || 3000;

let ejs = require("ejs");
let io = require("socket.io")(http);

app.use(express.static("static"));

app.get("/", (req, res) => res.render("../views/pages/index.ejs"));

io.on("connection", function(socket) {
  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
