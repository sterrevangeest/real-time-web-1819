var socket = io("");

socket.on("sessiondata", function(data) {
  console.info("sessiondata event received. Check the console");
  console.info("sessiondata is ", data);
});

socket.on("logged_in", function(data) {
  console.info("logged_in event received. Check the console");
  console.info("sessiondata after logged_in event is ", data);
  socket.emit("joinRoom", data);
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
  socket.emit("checkPlayersInRoom", data);
});

socket.on("players", function(players) {
  console.log(players);
});

const form = document.querySelector(".js-room-form");
if (form) {
  form.addEventListener("submit", sendRoom, false);

  function sendRoom(event) {
    event.preventDefault();
    let room = document.querySelector("#roomId");
    console.log(room);
    if (!room.value) {
      let roomId = (Math.random() + 1).toString(36).slice(2, 6);
      room.value = roomId;
    }
    form.submit();
  }
}

// createRoom.addEventListener("click", createNewRoom, false);
// joinGame.addEventListener("click", joinRoom, false);

// function createNewRoom() {
//   event.preventDefault();
//   const room = (Math.random() + 1).toString(36).slice(2, 6);
//   formData.append("roomId", room);
//   form.submit();
// }

// function joinRoom(event) {
//   event.preventDefault();
//   form.submit();
// }

// document
//   .getElementById("loginviasocket")
//   .addEventListener("click", function(e) {
//     socket.emit("login");
//     e.preventDefault();
//   });
// document
//   .getElementById("logoutviasocket")
//   .addEventListener("click", function(e) {
//     socket.emit("logout");
//     e.preventDefault();
//   });
// document
//   .getElementById("checksessionviasocket")
//   .addEventListener("click", function(e) {
//     socket.emit("checksession");
//     e.preventDefault();
//   });

// const nicknameForm = document.querySelector(".js-create-user");
// if (nicknameForm) {
//   nicknameForm.addEventListener("submit", getUser, false);
// }

// const bidFormSubmit = document.querySelector(".js-bet-form-submit");
// if (bidFormSubmit) {
//   bidFormSubmit.addEventListener("click", getBid, false);
// }
