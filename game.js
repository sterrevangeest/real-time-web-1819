const fetch = require("node-fetch");

exports.getCard = async function() {
  return await fetch("https://dog.ceo/api/breeds/image/random")
    .then(res => {
      return res.json();
    })
    .then(data => {
      const url = data.message;
      const points = getPoints();
      return { image: url, points: points };
    });
};

exports.getResult = (players, cards) => {
  const points = cards[cards.length - 1].points;
  const answers = players.map(player => player.bid);
  const tie = Object.is(answers[0], answers[1]);

  if (tie) {
    return players;
  } else {
    console.log(players);
    const winner = players.reduce((max, game) =>
      max.bid > game.bid ? max : game
    );

    winner.game += points;
    console.log(players);
    return players;
  }
};

exports.getEndResult = players => {
  const points = players.map(player => player.game);
  const tie = Object.is(points[0], points[1]);
  if (tie) {
    return players;
  } else {
    const finalWinner = players.reduce((prev, current) => {
      return prev.game > current.game ? prev : current;
    });
    return finalWinner;
  }
};

function getPoints() {
  const min = 10;
  const max = 100;
  const points = Math.floor(Math.random() * (max - min + 1) + min);
  return points;
}
