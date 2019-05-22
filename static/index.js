console.log("start");

// form.submit(function(e) {
//   e.preventDefault();
// });

$(".vrienduitnodigen").submit(function(e) {
  console.log("vriend uitnodigen");
  e.preventDefault(); // prevents page reloading
  return false;
});

function submitForm() {
  var form = document.querySelector(".vrienduitnodigen");
  var input = form.querySelector("input");
  console.log("vriend uitnodigen");
  var http = new XMLHttpRequest();
  var email = input.value;
  http.open("POST", "/vrienduitnodigen/" + email, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.send();
}

function submitVerzoek(input, invite) {
  console.log(input);
  console.log(invite);
  var http = new XMLHttpRequest();
  http.open("POST", "/vriendantwoord/" + input + "," + invite, true);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.send();
}
