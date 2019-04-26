"user strict";

require("dotenv").config();

const express = require("express");
const app = express();
var http = require("http").Server(app);
const port = process.env.PORT || 8000;
const crypto = require("crypto");
let ejs = require("ejs");
let io = require("socket.io")(http);
var request = require("request");
var bodyParser = require("body-parser");

const secret = "abcdefg";

const hash = crypto.createHmac("sha256", secret).digest("hex");
console.log(hash);

var users = [
  {
    voornaam: "Henk",
    achternaam: "Visser",
    gebruikersnaam: "henkdevries",
    wachtwoord: "vis",
    vrienden: [
      {
        gebruikersnaam: "jandeboer"
      }
    ],
    reis: [
      {
        direction: "Rhenen",
        plannedDateTime: "2019-04-25T15:33:00+0200",
        trainType: "Sprinter",
        plannedTrack: "3",
        tripId: "NS7455"
      }
    ]
  }
];

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static("static"));

app.post("/profile", (req, res) => {
  //gebruikersdata opslaan in "database"
  var userData = req.body;

  var test = users.map(function(user) {
    console.log(user.gebruikersnaam);
    console.log(userData.gebruikersnaam);
    if (user.gebruikersnaam === userData.gebruikersnaam) {
      var data = "gebruikersnaam is al in gebruik";
      res.render("../views/pages/createProfile.ejs", {
        data: data
      });
    } else {
      if (user.gebruikersnaam === userData.gebruikersnaam) {
      } else {
        users.push(userData);
        console.log(users);
        var data = userData;
        res.render("../views/pages/profile.ejs", {
          data: data
        });
      }
    }
  });
});

app.get("/selectStation", (req, res) => {
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
        return { stationName: station.namen.lang, stationId: station.UICCode };
      });
      console.log(results);

      res.render("../views/pages/selectStation.ejs", {
        data: results
      });
    } else {
      console.log(error);
    }
  }
  request(options, callback);
});

app.post("/vertrektijden", (req, res) => {
  var stationId = req.body.stationId.split(" ");
  console.log(stationId);

  var options = {
    url:
      "https://gateway.apiportal.ns.nl/public-reisinformatie/api/v2/departures?maxJourneys=25&lang=nl&uicCode=" +
      stationId[0],
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": "a25da04c7ab94cf1bf6a3663aa4fb712"
    }
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = JSON.parse(body);

      var data = data.payload.departures;
      console.log(data);
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

      res.render("../views/pages/trip.ejs", {
        data: stationId[1],
        departures: departures
      });
      console.log(departures);
    } else {
      console.log(error);
    }
  }
  request(options, callback);
});

app.get("/createProfile", (req, res) => {
  res.render("../views/pages/createProfile.ejs", {
    data: ""
  });
});

// var results = sporen.map(station => {
//   return { stationName: station.namen.lang, stationId: station.UICCode };
// });
// var departures = departures.map(item => item.payload.departures);
// var departures = departures.map(item => {
//   return item.map(item => {
//     return {
//       direction: item.direction,
//       plannedDateTime: item.plannedDateTime,
//       trainType: item.product.longCategoryName,
//       plannedTrack: item.plannedTrack,
//       tripId: item.name.replace(/\s/g, "")
//     };
//   });
// });

// app.post("/gebruiker", (req, res) => {
//   var name = req.body.name;
//   db.push({ clientName: name, clientId: 1 });
//   res.render("../views/pages/index.ejs", {
//     data: sporen
//   });
// });

app.post("/vertrektijden", function(req, res) {
  res.render("../views/pages/trip.ejs", {
    data: req.body.stationName,
    departures: departures
  });
});

app.get("/reis/:id", function(req, res) {
  var roomId = req.params.id;
  console.log(roomId);
  //getTrip

  res.render("../views/pages/reis.ejs", {
    data: req.params.id
  });
});

const tech = io.of("/tech");

tech.on("connection", socket => {
  socket.on("join", data => {
    socket.join(data.room);
    tech.in(data.room).emit("message", `New user joined ${data.room} room!`);
  });
  socket.on("message", data => {
    console.log("msg " + data.msg);
    tech.in(data.room).emit("message", data.msg);
  });

  socket.on("disconnect", data => {
    console.log("user disconnected");
    tech.in(data.room).emit("message", "user disconnected");
    tech.emit("message", "user disconnected");
  });
});

http.listen(port, () => console.log(`Example app listening on port ${port}!`));
