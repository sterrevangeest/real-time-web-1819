"use strict";
console.log("test");

var results = [
  { stationName: "Abcoude", stationId: "8400047" },
  { stationName: "Arnhem Centraal", stationId: "8400071" },
  { stationName: "Aachen Hbf", stationId: "8015345" },
  { stationName: "Arnhem Velperpoort", stationId: "8400072" },
  { stationName: "Arnhem Presikhaaf", stationId: "8400075" },
  { stationName: "Arnhem Zuid", stationId: "8400227" },
  { stationName: "Aime-la-Plagne", stationId: "8774176" },
  { stationName: "Aix-en-Provence TGV", stationId: "8731901" },
  { stationName: "Arkel", stationId: "8400068" },
  { stationName: "Akkrum", stationId: "8400049" },
  { stationName: "Albertville", stationId: "8774164" },
  { stationName: "Almere Centrum", stationId: "8400080" },
  { stationName: "Almere Buiten", stationId: "8400081" },
  { stationName: "Almere Muziekwijk", stationId: "8400082" },
  { stationName: "Almere Oostvaarders", stationId: "8400226" },
  { stationName: "Almere Parkwijk", stationId: "8400104" },
  { stationName: "Amersfoort", stationId: "8400055" },
  { stationName: "Amersfoort Schothorst", stationId: "8400054" },
  { stationName: "Almelo", stationId: "8400051" },
  { stationName: "Alkmaar", stationId: "8400050" },
  { stationName: "Almelo de Riet", stationId: "8400520" },
  { stationName: "Alkmaar Noord", stationId: "8400052" },
  { stationName: "Anna Paulowna", stationId: "8400065" },
  { stationName: "Antwerpen-Noorderdokken", stationId: "8821089" },
  { stationName: "Apeldoorn", stationId: "8400066" },
  { stationName: "Apeldoorn De Maten", stationId: "8400233" },
  { stationName: "Apeldoorn Osseveld", stationId: "8400229" },
  { stationName: "Appingedam", stationId: "8400067" },
  { stationName: "Alphen a/d Rijn", stationId: "8400053" },
  { stationName: "Arnemuiden", stationId: "8400069" },
  { stationName: "Amsterdam Amstel", stationId: "8400057" },
  { stationName: "Amsterdam Bijlmer ArenA", stationId: "8400074" },
  { stationName: "Amsterdam Centraal", stationId: "8400058" },
  { stationName: "Amsterdam Lelylaan", stationId: "8400079" },
  { stationName: "Amsterdam Muiderpoort", stationId: "8400060" },
  { stationName: "Amsterdam Zuid", stationId: "8400061" },
  { stationName: "Amsterdam Holendrecht", stationId: "8400231" },
  { stationName: "Assen", stationId: "8400073" },
  { stationName: "Amsterdam Sloterdijk", stationId: "8400059" },
  { stationName: "Amsterdam Science Park", stationId: "8400235" },
  { stationName: "Aalten", stationId: "8400045" }
];

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

app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("../views/pages/index.ejs");
});

app.get("/signup", (req, res) => {
  res.render("../views/pages/singup.ejs");
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(error => console.log(error));

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      let userId = firebaseUser.uid;
      firebase
        .database()
        .ref(userId)
        .set({
          userId: userId,
          password: password,
          name: name,
          email: email,
          connections: [
            {
              name: "Henk de Boer",
              email: "henk123@hotmail.nl",
              userId: "wzkv2PULDAM7oIRy4tJJf1XFlIa2"
            }
          ],
          invitations: []
        })
        .then(user => {
          console.log(user);
          res.render("../views/pages/profile.ejs", {
            user: user
          });
        });
    } else {
      console.log("not logged in");
    }
  });
});

app.post("/login", (req, res) => {
  console.log("PARAMS", req.params);
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .catch(error => console.log(error));

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      firebase
        .database()
        .ref()
        .child(firebaseUser.uid)
        .on("value", snapshot => {
          console.log(snapshot.val());
          res.render("../views/pages/profile.ejs", {
            user: snapshot.val(),
            data: results,

            invite: []
          });
        });
    } else {
      console.log("not logged in");
    }
  });
});

app.post("/vrienduitnodigen/:email", (req, res) => {
  var inviteThisEmail = req.params.email;
  console.log(inviteThisEmail);
  firebase
    .database()
    .ref()
    .child(inviteThisEmail)
    .once("value")
    .then(function(snapshot) {
      console.log(snapshot.val());
    });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
