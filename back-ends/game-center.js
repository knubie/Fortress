var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');
var Chess = require('../engine/Main');
var GameCenterManager = React.NativeModules.GameCenterManager;

//  compressGame :: (Game) -> Object
var compressGame = R.evolve({
  turn: R.always('white'),
  plys: R.map(ply => {
    if (R.is(Types.MovePly, ply)) {
      return R.assoc('type', 'MovePly', ply);
    } else if (R.is(Types.DrawPly, ply)) {
      return R.assoc('type', 'DrawPly', ply);
    } else if (R.is(Types.AbilityPly, ply)) {
      return R.assoc('type', 'AbilityPly', ply);
    } else if (R.is(Types.UseCardPly, ply)) {
      return R.assoc('type', 'UseCardPly', ply);
    } else {
      return ply;
    }
  })
});

//  instantiateGame :: (Object) -> Game
var instantiateGame = R.compose(Types.Game.of, R.evolve({
  board: R.compose(Types.Board.of, R.evolve({
    pieces: R.map(R.compose(Types.Piece.of, R.evolve({
      position: Types.Position.of
    })))
  })),
}));

var uncompressGame = function(game) {
  var baseGame = instantiateGame(game);
  return Chess.getGameFromPlys(
    Types.Game.of(R.assoc('plys', [], baseGame)),
    baseGame.plys);
}

var getBaseGame = function(game) {
  return Types.Game.of(R.evolve({
    plys: R.always([]),
    board: R.compose(Types.Board.of, R.evolve({
      pieces: R.map(R.compose(Types.Piece.of, R.evolve({
        position: Types.Position.of
      })))
    })),
  }, game));
}

//  encode :: (Game) -> String(JSON)
var encode = R.compose(JSON.stringify, compressGame);

module.exports = {
  endTurnWithGame: function(game) {
    GameCenterManager.endTurnWithNextParticipants(JSON.stringify(compressGame(game)));
  },
  endTurnWithPlys: function(baseGame, plys) {
    GameCenterManager.
      endTurnWithNextParticipants(
          JSON.stringify(
            compressGame(R.assoc('plys', plys, baseGame))));
  },
  endTurnWithNextParticipants: function(game) {
    GameCenterManager.endTurnWithNextParticipants(encode(game));
  },
  endMatchInTurnWithMatchData: function(baseGame, plys) {
    GameCenterManager.
      endMatchInTurnWithMatchData(
          JSON.stringify(
            compressGame(R.assoc('plys', plys, baseGame))));
  },
  endMatchInTurnWithMatchDataAsALoss: function(baseGame, plys) {
    GameCenterManager.
      endMatchInTurnWithMatchDataAsALoss(
          JSON.stringify(
            compressGame(R.assoc('plys', plys, baseGame))));
  },
  getBaseGame: function(data) {
    return getBaseGame(JSON.parse(data));
  },
  instantiateGame: instantiateGame,
//decode :: (String(JSON)) -> Game
  //decode: R.compose(instantiateObjects, JSON.parse)
  decode: R.compose(uncompressGame, JSON.parse),
}
