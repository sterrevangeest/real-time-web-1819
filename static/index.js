const form = document.querySelector(".js-room-form");
const pointsEl = document.querySelector(".js-points");

let myFuncCalls = 0;

if (form) {
	form.addEventListener("submit", sendRoom, false);

	function sendRoom(event) {
		event.preventDefault();
		let room = document.querySelector("#roomId");
		if (!room.value) {
			let roomId = Math.floor(1000 + Math.random() * 9000);
			room.value = roomId;
		}
		form.submit();
	}
}

var socket = io("");

socket.on("players", function(players) {
	const opponentEl = document.querySelectorAll(".js-opponent");
	const opponentPointsEl = document.querySelector(".js-opponent-points");
	const game = document.querySelector(".js-game-form");
	const opponent = players.filter(player => player.id != socket.id);
	if (opponent.length != 0) {
		opponentEl.forEach(element => {
			element.innerHTML = opponent[0].username;
		});
		opponentPointsEl.innerHTML = "0";
		game.classList.remove("display-none");
	}
});

socket.on("sendCard", function(dog) {
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
		myFuncCalls++;
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
	const opponentPointsEl = document.querySelector(".js-opponent-points");
	const pointsEl = document.querySelector(".js-current-user-points");
	opponentPointsEl.innerHTML = opponentUser[0].game;
	pointsEl.innerHTML = currentUser[0].game;
	if (myFuncCalls > 3) {
		socket.emit("endOfGame");
	}
});

socket.on("opponentBid", function(opponentBid) {
	const opponentBidEl = document.querySelector(".js-opponent-bid");
	opponentBidEl.innerHTML = opponentBid;
});

socket.on("endResult", function(message) {
	const form = document.querySelector(".js-game-form");
	form.classList.add("display-none");
	const resultEl = document.querySelector(".js-end-result");
	resultEl.innerHTML = message;
	setTimeout(function() {
		window.location.href = "/";
		socket.emit("redirect");
	}, 5000);
});
