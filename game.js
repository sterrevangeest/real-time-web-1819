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

function getPoints() {
  const min = 10;
  const max = 100;
  const points = Math.floor(Math.random() * (max - min + 1) + min);
  return points;
}

exports.getResult = (players, cards) => {
  const answers = players.map(player => player.bid);
  const tie = Object.is(answers[0], answers[1]);

  if (tie) {
    console.log("gelijk gespeeld");
    return `Jullie hebben allebei hetzelfde geboden!`;
  } else {
    const winner = players.reduce((max, game) =>
      max.bid > game.bid ? max : game
    );
    //   const loser = players.reduce((max, game) =>
    //     max.bid < game.bid ? max : game
    //   );
    const currentCard = cards[cards.length - 1];
    console.log(currentCard);
    winner.game += currentCard.points;
    return `${winner.username} heeft gewonnen!`;
  }
};
