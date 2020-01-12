const form = document.querySelector(".js-room-form");
if (form) {
  console.log(form);
  form.addEventListener("submit", sendRoom, false);

  function sendRoom(event) {
    event.preventDefault();
    let room = document.querySelector("#roomId");
    console.log(room.value);
    if (!room.value) {
      let roomId = (Math.random() + 1).toString(36).slice(2, 6);
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
  console.log("alle spelers in deze room", players);
});

socket.on("sendCard", function(dog) {
  console.log("nieuwe card");
  const dogSrc = document.querySelector(".js-dogSrc");
  const points = document.querySelector(".js-points");
  points.innerHTML = dog.points;
  dogSrc.src = dog.image;
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
    console.log(value);
    socket.emit("bid", value);
  }
  getCheckedInput(checkboxName);
}

socket.on("message", function(message) {
  console.log(message);
});

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
