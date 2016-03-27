var R        = require('ramda');
var check    = require('./lib/type-checker').checkAll;
var Cards    = require('./Cards');
var Types    = require('./Types');
var Pieces   = require('./Pieces');
var Game     = Types.Game;
var Board    = Types.Board;
var Piece    = Types.Piece;
var Position = Types.Position;

for (var k in R) {
  var topLevel = typeof global === 'undefined' ? window : global;
  topLevel[k] = R[k];
}

//  colorToIndex :: (String) -> Number
var colorToIndex = curry(function(color) {
  return color === 'white' ? 0 : 1;
});

//  message :: (String, Game) -> Game
var message = curry(function(message, game) {
  check(arguments, [String, Game]);
  return Game.of(assoc('message', message, game));
});

// drawCard :: (String, Game) -> Game
var drawCard = curry(function(color, game) {
  // TODO: change to integer
  var playerIndex = colorToIndex(color);
  if (game.decks[playerIndex].length < 1) {
    return message('Your deck is empty!', game);
  } else {
    return Game.of(evolve({
      decks: adjust(remove(0, 1), playerIndex),
      hands: adjust(prepend(game.decks[playerIndex][0]), playerIndex)
    }, game));
  }
});

//  addPiece :: ([Piece], Piece) -> [Piece]
var addPiece = curry(function(pieces, piece) {
  check(arguments, [[Piece], Piece]);
  return append(piece, reject(propEq('position', piece.position), pieces));
});


//  addPieceToBoard :: (Piece, Board) -> Board
var addPieceToBoard = curry(function(piece, board) {
  check(arguments, [Piece, Board]);
  return Board.of(evolve({
    pieces: addPiece(__, piece)
  }, board));
});

//  addResources :: (Game, Number, Number) -> Game
var addResources = curry(function(game, playerIndex, amount) {
  return Game.of(evolve({
    resources: adjust(
      compose(
        min(game.maxResources[playerIndex]),
        add(amount)
      ),
      playerIndex)
  }, game));
});

//  getPieceAtPosition :: (Board, String, Position) -> Maybe Piece
var getPieceAtPosition = curry(function(board, color, position) {
  check(arguments, [Board, String, Position]);
  var positionAndColor = both(propEq('position', position), propEq('color', color));
  return find(positionAndColor, board.pieces);
});

//  getAnyPieceAtPosition :: (Board, Position) -> Maybe Piece
var getAnyPieceAtPosition = curry(function(board, position) {
  check(arguments, [Board, Position]);
  return getPieceAtPosition(board, 'white', position) ||
         getPieceAtPosition(board, 'black', position);
});

module.exports = {
  colorToIndex,
  message,
  drawCard,
  addPiece,
  addPieceToBoard,
  addResources,
  getAnyPieceAtPosition,
  getPieceAtPosition,
};
