var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');
var Chess = require('../engine/Main');
var GameCenterManager = React.NativeModules.GameCenterManager;

var newGame = function(matchID) {
  var boardSize = 7;
  return Types.Game.of({
    turn: 'white',
    matchID: matchID,
    board: Types.Board.of({
      size: boardSize,
      pieces: [
        Types.Piece.of({
          name: 'king',
          color: 'white',
          position: Types.Position.of({x: 3, y: 0}),
        }),
        Types.Piece.of({
          name: 'king',
          color: 'black',
          position: Types.Position.of({x: 3, y: boardSize - 1}),
        }),
      ]
    }),
    resources: [2, 2],
    plys: []
  });
}

//  makePly :: (Game, Ply) -> Game
var makePly = function(game, ply) {
  if (ply.type === 'MovePly') {
    return Chess.movePly(
      Types.Piece.of(R.evolve({position: Types.Position.of}, ply.piece)),
      Types.Position.of(ply.position),
      game);
  } else if (ply.type === 'DrawPly') {
    return Chess.drawCardPly(game.turn, game);
  } else if (ply.type === 'AbilityPly') {
    return Chess.abilityPly(
      Types.Piece.of(R.evolve({position: Types.Position.of}, ply.piece)),
      game);
  } else if (ply.type === 'UseCardPly') {
    return Chess.useCardPly(game.turn, ply.card, {
      positions: R.map(Types.Position.of, ply.params.positions || [])
    }, game);
  } else { // draft
    return Types.Game.of(R.evolve({
      plys: R.append('draft'),
    }, game));
    //return game;
  }
}

//  generateGameFromPlys :: (Ply) -> Game
var generateGameFromPlys = R.reduce(makePly, newGame());

//  compressGame :: (Game) -> Object
var compressGame = R.evolve({
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

//  instantiateObjects :: (Object) -> Game
var instantiateObjects = R.compose(Types.Game.of, R.evolve({
  plys: R.always([]),
  board: R.compose(Types.Board.of, R.evolve({
    pieces: R.map(R.compose(Types.Piece.of, R.evolve({
      position: Types.Position.of
    })))
  })),
}));

var uncompressGame = function(game) {
  var baseGame = Types.Game.of(R.evolve({
    board: R.compose(Types.Board.of, R.evolve({
      pieces: R.map(R.compose(Types.Piece.of, R.evolve({
        position: Types.Position.of
      })))
    })),
    //plys: R.map(ply => {
      //if (ply.type === 'MovePly') {
        //return Types.MovePly.of(ply);
      //} else if (ply.type === 'DrawPly') {
        //return Types.DrawPly.of(ply);
      //} else if (ply.type === 'AbilityPly') {
        //return Types.AbilityPly.of(ply);
      //} else if (ply.type === 'UseCardPly') {
        //return Types.UseCardPly.of(ply);
      //} else {
        //return ply;
      //}
    //}),
  }, game));
  return R.reduce(makePly, R.assoc('plys', [], baseGame), baseGame.plys);
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

//  getGameFromPlys :: (Game, [Ply]) -> Game
var getGameFromPlys = R.reduce(makePly);

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
  getBaseGame: function(data) {
    return JSON.parse(data);
  },
  instantiateObjects: instantiateObjects,
  makePly: makePly,
//decode :: (String(JSON)) -> Game
  //decode: R.compose(instantiateObjects, JSON.parse)
  decode: R.compose(uncompressGame, JSON.parse)
}
