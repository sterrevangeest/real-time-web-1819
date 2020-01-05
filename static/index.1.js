var socket = io("");

const nicknameForm = document.querySelector(".js-create-user");
if (nicknameForm) {
  nicknameForm.addEventListener("submit", getUser, false);
}

const bidFormSubmit = document.querySelector(".js-bet-form-submit");
if (nicknameForm) {
  bidFormSubmit.addEventListener("click", getBid, false);
}

const currentUser = [];

function getUser(event) {
  event.preventDefault();
  showNext();

  const nickname = document.querySelector("#nickname").value;
  const createRoom = document.querySelector(".js-create-room");
  const joinGame = document.querySelector(".js-join-room");

  createRoom.addEventListener("click", createNewRoom, false);
  joinGame.addEventListener("click", joinRoom, false);

  function createNewRoom() {
    event.preventDefault();
    const room = (Math.random() + 1).toString(36).slice(2, 6);
    console.log(nickname, room);
    let user = createUser(nickname, room);
    socket.emit("createUser", user);
  }

  function joinRoom(event) {
    event.preventDefault();
    const room = document.querySelector("#roomId").value;
    console.log(room);
    let user = createUser(nickname, room);
    socket.emit("createUser", user);
  }
}

socket.on("roomId", function(room) {
  console.log(room);
  showGame();
  const roomId = document.querySelector(".js-room-id");
  roomId.innerHTML = `Game pin: ${room}`;
});

socket.on("players", function(players) {
  const playersElement = document.querySelector(".js-players");
  const playerNames = players.map(player => player.nickname);
  playersElement.innerHTML = `<p>${playerNames}</p>`;

  if (players.length > 1) {
    const gameForm = document.querySelector(".js-game-form");
    gameForm.classList.remove("display-none");
  } else {
    console.log("waiting for another player");
  }
});

socket.on("dog", function(dog) {
  const dogSrc = document.querySelector(".js-dogSrc");
  const points = document.querySelector(".js-points");
  points.innerHTML = dog.points;
  dogSrc.src = dog.image;
});

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
  }
  getCheckedInput(checkboxName);
}

socket.on("message", function(message) {
  console.log(message);
});

function createUser(nickname, room) {
  const user = {
    id: socket.id,
    nickname: nickname,
    bid: { value: 0, points: 0 },
    game: 0,
    room: room
  };
  currentUser.push(user);
  return user;
}

function showNext() {
  console.log("show next");
  const roomForm = document.querySelector(".js-room-form");
  const nextButton = document.querySelector(".js-next");

  roomForm.classList.remove("display-none");
  nextButton.classList.add("display-none");
}
function showGame() {
  console.log("show game");
  const game = document.querySelector(".js-game");
  const createUserForm = document.querySelector(".js-nickname-form");
  game.classList.remove("display-none");
  createUserForm.classList.add("display-none");
}

socket.on("redirect", function(destination) {
  window.location.href = destination;
});
