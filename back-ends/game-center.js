var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');
var GameCenterManager = React.NativeModules.GameCenterManager;

//  compressGame :: (Game) -> Object
var compressGame = R.evolve({
  plys: R.map(ply => {
    if (R.is(Array, ply)) {
      return '' + ply[0].x + ply[0].y + ply[1].x + ply[1].y;
    } else { return ply }
  })
});

//  instantiateObjects :: (Object) -> Game
var instantiateObjects = R.compose(Types.Game.of, R.evolve({
  board: R.compose(Types.Board.of, R.evolve({
    pieces: R.map(R.compose(Types.Piece.of, R.evolve({
      position: Types.Position.of
    })))
  })),
  // TODO: account for plyTypes
  //plys: R.map(ply => {
    //if (ply !== 'draft') {
      //return [Types.Position.of({x: parseInt(ply[0]), y: parseInt(ply[1])}),
              //Types.Position.of({x: parseInt(ply[2]), y: parseInt(ply[3])})]
    //} else { return ply }
  //})
}));

//  encode :: (Game) -> String(JSON)
var encode = R.compose(JSON.stringify, compressGame);

module.exports = {
  endTurnWithNextParticipants: function(game) {
    GameCenterManager.endTurnWithNextParticipants(encode(game));
  },
  endMatchInTurnWithMatchData: function(game) {
    GameCenterManager.endMatchInTurnWithMatchData(encode(game));
  },
//decode :: (String(JSON)) -> Game
  decode: R.compose(instantiateObjects, JSON.parse)
}
