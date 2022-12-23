const Game = require("../database/schema").Game;

const fetchUserGames = async (req, res) => {
  try {
    const username = req.user.username;
    const games = await Game.find({
      $or: [{ player1: username }, { player2: username }],
    }).then((res) => res && res.map((game) => game.toJSON()));
    if (!games || games.length === 0) {
      return res.status(200).json({ games: [] });
    }
    res.status(200).json({ games: games });
  } catch (err) {
    res.send(err);
  }
};

const fetchGame = async (id) => {
  const games = await Game.find({
    id: id,
  }).then((res) => res && res.map((game) => game.toJSON()));
  return games;
};

const createGame = async (player1, player2) => {
  const gameId = `${player1}-${player2}`;
  const game = await fetchGame(gameId);
  if (game && game.length > 0) {
    return { error: "Game already exists" };
  }
  const newGame = new Game({
    id: gameId,
    player1: player1,
    player2: player2,
    board: ["", "", "", "", "", "", "", "", ""],
    turn: player1,
    winner: "",
    date: new Date(),
  });
  newGame.save();
  return newGame.toJSON();
};

const updateGame = async (req, res) => {
  try {
    const id = req.params.id;
    const { board, turn, winner } = req.body;
    const game = await fetchGame(id);
    if (!game || game.length === 0) {
      return res.status(400).json({ error: "Game not found" });
    }
    const updatedGame = await Game.findOneAndUpdate(
      { id: id },
      {
        board: board,
        turn: turn,
        winner: winner,
      }
    );
    res.status(200).json({ game: updatedGame.toJSON() });
  } catch (err) {
    res.send(err);
  }
};

module.exports = { fetchUserGames, fetchGame, createGame, updateGame };
