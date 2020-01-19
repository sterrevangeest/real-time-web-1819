const form = document.querySelector(".js-room-form");
const pointsEl = document.querySelector(".js-points");

if (form) {
  console.log(form);
  form.addEventListener("submit", sendRoom, false);

  function sendRoom(event) {
    event.preventDefault();
    let room = document.querySelector("#roomId");
    console.log(room.value);
    if (!room.value) {
      let roomId = Math.floor(1000 + Math.random() * 9000);
      console.log(roomId);
      room.value = roomId;
    }
    form.submit();
  }
}

var socket = io("");

socket.on("sessiondata", function(data) {
  console.info("sessiondata event received. Check the console");
  console.info("sessiondata is ", data);
});

socket.on("logged_in", function(data) {
  console.info("logged_in event received. Check the console");
  console.info("sessiondata after logged_in event is ", data);
});
socket.on("logged_out", function(data) {
  console.info("logged_out event received. Check the console");
  console.info("sessiondata after logged_out event is ", data);
});
socket.on("checksession", function(data) {
  console.info("checksession event received. Check the console");
  console.info("sessiondata after checksession event is ", data);
});

socket.on("roomId", function(data) {
  console.info("Joined roomId ", data);
});

socket.on("players", function(players) {
  const opponentEl = document.querySelectorAll(".js-opponent");
  const opponentPointsEl = document.querySelector(".js-opponent-points");
  const game = document.querySelector(".js-game-form");
  const opponent = players.filter(player => player.id != socket.id);
  if (opponent.length != 0) {
    console.log(opponent[0].username);
    opponentEl.forEach(element => {
      element.innerHTML = opponent[0].username;
    });
    opponentPointsEl.innerHTML = "0";
    game.classList.remove("display-none");
  }
});

socket.on("sendCard", function(dog) {
  console.log("nieuwe card");
  const overlayEl = document.querySelector(".js-overlay");
  overlayEl.classList.add("display-none");
  const dogSrc = document.querySelector(".js-dogSrc");
  const points = document.querySelector(".js-points");
  points.innerHTML = dog.points;
  dogSrc.src = dog.image;
  const opponentBidEl = document.querySelector(".js-opponent-bid");
  opponentBidEl.innerHTML = "...";
});

const bidFormSubmit = document.querySelector(".js-bet-form-submit");
if (bidFormSubmit) {
  bidFormSubmit.addEventListener("click", getBid, false);
}

function getBid(event) {
  event.preventDefault();
  const checkboxName = "bid";
  function getCheckedInput(checkboxName) {
    const checkedInput = document.querySelector(
      'input[name="' + checkboxName + '"]:checked'
    );
    const value = parseInt(checkedInput.value);
    checkedInput.disabled = true;
    socket.emit("bid", value);
    const pointsEl = document.querySelector(".js-bid");
    pointsEl.innerHTML = value;
  }

  const overlayEl = document.querySelector(".js-overlay");
  overlayEl.classList.remove("display-none");
  getCheckedInput(checkboxName);
}

socket.on("message", function(result) {
  const id = socket.io.engine.id;
  const currentUser = result.filter(user => user.id == socket.io.engine.id);
  const opponentUser = result.filter(user => user.id != socket.io.engine.id);
  console.log(currentUser, opponentUser);
  const opponentPointsEl = document.querySelector(".js-opponent-points");
  const pointsEl = document.querySelector(".js-current-user-points");
  opponentPointsEl.innerHTML = opponentUser[0].game;
  pointsEl.innerHTML = currentUser[0].game;
});

socket.on("opponentBid", function(opponentBid) {
  console.log(opponentBid);
  const opponentBidEl = document.querySelector(".js-opponent-bid");
  opponentBidEl.innerHTML = opponentBid;
});

socket.on("endResult", function(message) {
  console.log(message);
  const form = document.querySelector(".js-game-form");
  form.classList.add("display-none");
  const resultEl = document.querySelector(".js-end-result");
  resultEl.innerHTML = message;
});
