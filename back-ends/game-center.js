var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');
var GameCenterManager = React.NativeModules.GameCenterManager;

//  stripParletts :: (Game) -> Object
var stripParletts = R.evolve({
  board: R.evolve({ pieces: R.map(R.dissoc('parlett')) })
});

//  instantiateObjects :: (Object) -> Game
var instantiateObjects = R.compose(Types.Game.of, R.evolve({
  board: R.compose(Types.Board.of, R.evolve({
    pieces: R.map(R.compose(Types.Piece.of, R.evolve({
      position: Types.Position.of
    })))
  }))
}));

//  encode :: (Game) -> String(JSON)
var encode = R.compose(JSON.stringify, stripParletts);

module.exports = {
  endTurnWithNextParticipants: function(game) {
    GameCenterManager.endTurnWithNextParticipants(encode(game));
  },
//decode :: (String(JSON)) -> Game
  decode: R.compose(instantiateObjects, JSON.parse)
}
