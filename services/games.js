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

const findGameById = async (id) => {
  const games = await Game.find({
    id: id,
  }).then((res) => res && res.map((game) => game.toJSON()));
  return games;
};

const fetchGame = async (req, res) => {
  try {
    const id = req.params.id;
    const game = await findGameById(id);
    if (!game || game.length === 0) {
      return res.status(400).json({ error: "Game not found" });
    }
    res.status(200).json({ game: game[0] });
  } catch (err) {
    res.send(err);
  }
};

const createGame = async (player1, player2) => {
  const timestamp = new Date().getTime();
  const gameId = `${player1}-${player2}-${timestamp}`;
  const game = await Game.find({
    id: gameId,
    winner: "",
  }).then((res) => res && res.map((game) => game.toJSON()));
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

const updateGame = async (id, board, turn, winner) => {
  const game = await findGameById(id);
  if (!game || game.length === 0) {
    return { error: "Game not found" };
  }
  const updatedGame = await Game.findOneAndUpdate(
    { id: id },
    { turn: turn, board: board, winner: winner }
  );
  return updatedGame.toJSON();
};

module.exports = { fetchUserGames, fetchGame, createGame, updateGame };
