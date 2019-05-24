"use strict";
console.log("test");

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const http = require("http").Server(app);
const bodyParser = require("body-parser");
const uniqid = require("uniqid");
const request = require("request");

const dotenv = require("dotenv");
require("dotenv").config();

let ejs = require("ejs");
let io = require("socket.io")(http);

const firebase = require("firebase/app");

require("firebase/auth");
require("firebase/firestore");
require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyBrW-sPy0YSHm-2Sw3oWusCXpLbRDuA308",
  authDomain: "realtime-c903e.firebaseapp.com",
  databaseURL: "https://realtime-c903e.firebaseio.com",
  projectId: "realtime-c903e",
  storageBucket: "realtime-c903e.appspot.com",
  messagingSenderId: "916585688737",
  appId: "1:916585688737:web:2e71eef1ee707b30"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
app.set("view engine", "ejs");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("../views/pages/index");
});

app.get("/signup", (req, res) => {
  res.render("../views/pages/singup");
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(user => {
      var currentUserId = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref(currentUserId)
        .set({
          userId: currentUserId,
          password: password,
          name: name,
          email: email,
          connections: [
            {
              name: "Henk",
              email: "henk1@hotmail.nl",
              userId: "yagbKHZpZLSwYgOlR9MLVCcTwH92"
            }
          ],
          invitations: []
        });
    })
    .then(response => {
      var currentUserId = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref()
        .child(currentUserId)
        .on("value", snapshot => {
          console.log(snapshot.val());
          res.render("../views/pages/profile.ejs", {
            user: snapshot.val(),
            data: [],
            invite: []
          });
        });
    })
    .catch(error => console.log(error));
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(user => {
      var currentUserId = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref()
        .child(currentUserId)
        .on("value", snapshot => {
          console.log(snapshot.val());
          var options = {
            url:
              "https://gateway.apiportal.ns.nl/public-reisinformatie/api/v2/stations",
            headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": "a25da04c7ab94cf1bf6a3663aa4fb712"
            }
          };

          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
              var data = JSON.parse(body);
              var data = data.payload;

              var results = data.map(station => {
                return {
                  stationName: station.namen.lang,
                  stationId: station.UICCode
                };
              });
              res.render("../views/pages/profile.ejs", {
                user: snapshot.val(),
                data: results,
                invite: []
              });
            } else {
              console.log(error);
            }
          }
          request(options, callback);
        });
    })
    .catch(error => console.log(error));
});

app.post("/vrienduitnodigen/:email", (req, res) => {
  var inviteThisEmail = req.params.email;
});

app.post("/vertrektijden", function(req, res) {
  //console.log(req.body.stationId);
  var stationName = req.body.stationId.split(" ")[1];
  var stationId = req.body.stationId.split(" ")[0];
  var options = {
    url:
      "https://gateway.apiportal.ns.nl/public-reisinformatie/api/v2/departures?maxJourneys=25&lang=nl&uicCode=" +
      stationId,
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": "a25da04c7ab94cf1bf6a3663aa4fb712"
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      var data = data.payload.departures;

      // var departures = data.map(item => item.payload.departures);
      var departures = data.map(item => {
        return {
          direction: item.direction,
          plannedDateTime: item.plannedDateTime,
          trainType: item.product.longCategoryName,
          plannedTrack: item.plannedTrack,
          tripId: item.name.replace(/\s/g, "")
        };
      });

      res.render("../views/pages/vertrektijden.ejs", {
        data: stationName,
        stationId: stationId,
        departures: departures
      });
    } else {
      console.log(error);
    }
  }
  request(options, callback);
});

app.get("/reis/:id", function(req, res) {
  var roomId = req.params.id;
  //console.log(roomId);
  let usersInSameRoom = [];
  let currentUserId = firebase.auth().currentUser.uid;

  firebase
    .database()
    .ref()
    .child(currentUserId)
    .update({ roomId: roomId });

  firebase
    .database()
    .ref()
    .once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key;
        var hasRoomId = childSnapshot.hasChild("roomId"); // true
        if (hasRoomId === true) {
          console.log("ROOMID", childSnapshot.val().roomId);
          if (childSnapshot.val().roomId === roomId) {
            console.log(childSnapshot.val().roomId);
            console.log(roomId);
            console.log("ook nog zelfd room ID");
            usersInSameRoom.push(childSnapshot.val());
            console.log(usersInSameRoom);
          } else {
            console.log("NIET ZELFDE ROOM ID");
          }
          //check of ze hetzelfde nummer hebben en het vrienden zijn
        } else {
          console.log("niet gelukt om een ROOMid te vinden");
        }
      });

      var possibleFriends = usersInSameRoom.map(user => {
        if (user.userId !== currentUserId) {
          //haal alle andere user Ids op

          if (user.userId !== undefined) {
            return user.userId;
          }
        }
      });

      firebase
        .database()
        .ref()
        .child(currentUserId)
        .once("value")
        .then(function(snapshot) {
          console.log(snapshot.val());
          var user = snapshot.val();
          var friend = user.connections.map(item => {
            console.log(item);
            for (var i = 0; i < possibleFriends.length; i++) {
              if (item.userId === possibleFriends[i]) {
                console.log("VRIENDON");
                return possibleFriends[i];
              } else {
                console.log("geen vriendon");
              }
            }
          });
          console.log(friend);
          return friend;
        })
        .then(friend => {
          for (var i = 0; i < friend.length; i++) {
            firebase
              .database()
              .ref(friend[i])
              .once("value")
              .then(function(snapshot) {
                res.render("../views/pages/medereizigers", {
                  data: roomId,
                  friendsInSameRoom: [snapshot.val()], //data van de friend in dezelfde room
                  usersInSameRoom: possibleFriends
                });
              });
          }
        })
        .catch(error => console.log(error));
    });
});

app.get("/chat/:userId", function(req, res) {
  res.render("../views/pages/chat.ejs", {
    data: req.params
  });
});

const tech = io.of("/tech");

tech.on("connection", socket => {
  socket.on("join", data => {
    socket.join(data.room);
    // tech.in(data.room).emit("message", `New user joined ${data.room} room!`);
  });
  socket.on("message", data => {
    console.log("msg " + data.msg);
    tech.in(data.room).emit("message", data.msg);
  });

  socket.on("disconnect", data => {
    console.log("user disconnected");
    tech.in(data.room).emit("message", "user disconnected");
    //tech.emit("message", "user disconnected");
  });
});

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("user is signed in");
  } else {
    console.log("user is signed out");
  }
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
