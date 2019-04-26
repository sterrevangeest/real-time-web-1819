console.log("!");

// $(function() {
//   var socket = io();
//   $("form").submit(function(e) {
//     e.preventDefault(); // prevents page reloading
//     socket.emit("chat message", $("#m").val());
//     $("#m").val("");
//     return false;
//   });
//   socket.on("chat message", function(msg) {
//     $("#messages").append($("<li>").text(msg));
//   });
// });

const room = "<%= data %>";
const socket = io("/tech");
$("form").submit(() => {
  let msg = $("#m").val();
  socket.emit("message", { msg, room });
  $("#m").val("");
  return false;
});

socket.on("connect", () => {
  // emiting to everybody
  socket.emit("join", { room: room });
});

socket.on("message", msg => {
  $("#messages").append($("<li>").text(msg));
});
