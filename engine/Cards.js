var R        = require('ramda');
var Util     = require('./Util');
var Types    = require('./Types');
var Pieces   = require('./Pieces');
var check    = require('./lib/type-checker').checkAll;
var Game     = Types.Game;
var Board    = Types.Board;
var Piece    = Types.Piece;
var Position = Types.Position;

for (var k in R) {
  var topLevel = typeof global === 'undefined' ? window : global;
  topLevel[k] = R[k];
}

for (var k in Util) {
  var topLevel = typeof global === 'undefined' ? window : global;
  topLevel[k] = Util[k];
}

//  positionsOfPieces :: [Piece] -> [Position]
var positionsOfPieces = map(prop('position'));

// Pieces

//  notRoyal :: [Piece] -> [Piece]
var notRoyal = reject(compose(contains('royal'), prop('types')));

//  allPieces :: Board -> [Piece]
var allPieces = prop('pieces');

//  playersPieces :: (Board, Color) -> [Piece]
var opponentsPieces = converge(
  call,
  [
    compose(filter, propEq('color'), oppositeColor, flip(identity)),
    allPieces
  ]
);

//  playersPieces :: (Board, Color) -> [Piece]
var playersPieces = converge(
  call,
  [
    compose(filter, propEq('color'), flip(identity)),
    allPieces
  ]
);


module.exports = {
  'perception': {
    points: 0,
    use: curry(function(game) {
      var color = game.turn;
      // TODO: replace with integer
      var playerIndex = colorToIndex(color);
      var newGame = drawCard(color, game);
      if (!newGame.message) {
        newGame = drawCard(color, newGame);
        if (!newGame.message) {
          newGame = drawCard(color, newGame);
        }
      }
      return newGame;
    }),
  },
  'steal': {
    points: 0,
    use: curry(function(game) {
      var color = game.turn;
      // TODO: replace with integer
      var playerIndex = colorToIndex(color);
      var oppIndex = playerIndex === 0 ? 1 : 0;
      var STEAL_PER_THIEF = 1;

      // Amount to steal; number of thieves on the board.
      var amount = (filter(where({
        color: equals(game.turn),
        name: equals('thief'),
      }), game.board.pieces).length * STEAL_PER_THIEF) + 1;

      return Game.of(evolve({
        resources: compose(
                     adjust(
                       // TODO: extract to Util
                       compose(
                         min(game.maxResources[playerIndex]),
                         add(min(amount, game.resources[oppIndex]))
                       ),
                       playerIndex
                     ),
                     adjust(
                       subtract(__, min(amount, game.resources[oppIndex])),
                       oppIndex
                     )
                   )
      }, game));
    }),
  },
  'foreign aid': {
    points: 0,
    use: function(game) {
      // TODO: use integer
      var playerIndex = colorToIndex(game.turn);
      return Game.of(evolve({
        resources: adjust(
                       // TODO: extract to Util
          compose(
           min(game.maxResources[playerIndex]),
           add(3)
          ),
          playerIndex
        )
      }, game));
    },
  },
  'influence': {
    points: 0,
    use: function(game, positions) {
      var count = 0;
      var turnIndex = colorToIndex(game.turn);
      return Game.of(evolve({
        afterTurn: append((game) => {
          // TODO: remove this function when finished.
          if (count === 0) { // Ending turn. (Now opponent's turn)
            count++;
            // Add a ply
            return Game.of(evolve({
              plysPerTurn: adjust(add(1), turnIndex),
              plysLeft: adjust(add(1), turnIndex)
            }, game));
          } else if (count === 1) { // Opponent ends turn. (Now your turn)
            count++;
            //do nothing.
            return game;
          } else if (count === 2) { // End turn again. (Now opponent's turn)
            count++;
            // Remove a ply
            return Game.of(evolve({
              plysPerTurn: adjust(subtract(__, 1), turnIndex),
              plysLeft: adjust(subtract(__, 1), turnIndex)
            }, game));
          } else {
            return game;
          }
        })
      }, game));
    },
  },
  'pawn': {
    points: 1,
    params: [],
  },
  'pin': {
    points: 1,
    use: curry(function(game, positions) {
      var index = indexOf(positions[0], map(prop('position'), game.board.pieces));
      return Game.of(evolve({
        board: compose(Board.of, evolve({
          pieces: adjust(function(piece) {
            // FIXME: this won't work!
            return Piece.of(evolve({
              afterMove: always(function(piece, game) {
                var index = indexOf(
                  piece.position,
                  map(prop('position'), game.board.pieces)
                );

                // TODO: HOLY SHIT PLEASE REWRITE THIS.
                var playerIndex = game.turn === 'white' ? 1 : 0;
                var oppColor = game.turn === 'white' ? 'black' : 'white';

                //return compose(
                  //addResources(__, index, 1),
                  //drawCard(game.turn)
                //)(game)

                var newGame = drawCard(oppColor, game);
                if (!newGame.message) {
                  newGame = drawCard(oppColor, newGame);
                  if (!newGame.message) {
                    newGame = drawCard(oppColor, newGame);
                  }
                }

                newGame = addResources(newGame, playerIndex, 2);

                return Game.of(evolve({
                  board: compose(Board.of, evolve({
                    pieces: adjust(function(piece) {
                      return Piece.of(evolve({
                        afterMove: always(null),
                        types: reject(equals('pinned')),
                      }, piece));
                    }, index),
                  }))
                }, newGame));

              }),
              types: append('pinned'),
              additionalEffects: append('Pinned until moved. If moved, opponent draws 3 card and gains 2 gold.')
            }, piece));
          }, index),
        }))
      }, game));
    }),
    // (Board, Color) -> [Position]
    params: compose(positionsOfPieces, notRoyal, opponentsPieces),
  },
  'demolition': {
    points: 1,
    use: function(game, positions) {
      var cardIndex = indexOf(positions[0], map(prop('position'), game.board.pieces));
      var playerIndex = colorToIndex(game.turn);
      return Game.of(evolve({
        resources: adjust(
          // TODO: extract to Util
          compose(
           min(game.maxResources[playerIndex]),
           add(3)
          ),
          playerIndex
        ),
        board: compose(Board.of, evolve({
          pieces: remove(cardIndex, 1),
        }))
      }, game));
    },
    params: compose(positionsOfPieces, playersPieces),
  },
  'library': {
    points: 1,
    params: [],
  },
  'factory': {
    points: 2,
    params: [],
  },
  'fortify': {
    points: 2,
    use: curry(function(game, positions) {
      var index = indexOf(positions[0], map(prop('position'), game.board.pieces));
      return Game.of(evolve({
        board: compose(Board.of, evolve({
          pieces: adjust(function(piece) {
            // FIXME: this won't work!
            return Piece.of(evolve({
              afterTurn: always(
                (function() {
                  var turnsBeforeRemoval = 2;
                  return function(piece2) {
                    turnsBeforeRemoval --;
                    if (turnsBeforeRemoval === 0) {
                      return Piece.of(evolve({
                        // get index instead of using length
                        types: remove(piece.types.length, 1),
                        // get index instead of using length
                        additionalEffects: remove(piece.additionalEffects.length, 1),
                      }, piece2));
                    } else {
                      return piece2;
                    }
                  }
                })()
              ),
              types: append('invincible'),
              additionalEffects: append('Invincible until the end of the next turn.')
            }, piece));
          }, index),
        }))
      }, game));
    }),
    // (Board, Color) -> [Position]
    params: compose(positionsOfPieces, playersPieces),
  },
  'coffer upgrade': {
    points: 2,
    use: function(game, positions) {
      return Game.of(evolve({
        maxResources: adjust(add(5), colorToIndex(game.turn))
      }, game));
    },
  },
  'shapeshifter': {
    points: 2,
    // onCapture :: (Piece, Piece, Game) -> Game
    onCapture: curry(function(oldPiece, piece, capturedPiece, game) {
      check(arguments, [Piece, Piece, Piece, Game]);
      var board = game.board;
      var newBoard;
      var newPiece = Piece.of(evolve({
        color: always(piece.color),
        moves: always(piece.moves),
        captures: always(piece.captures),
        parlett: always(capturedPiece.parlett)
      }, capturedPiece))
      newBoard = Board.of(evolve({
        pieces: adjust(
                  always(newPiece),
                  indexOf(piece, board.pieces))
      }, board));
      return Game.of(evolve({
        board: always(newBoard)
      }, game));
    }),
    params: [],
  },
  'bishop': {
    points: 3,
    params: [],
  },
  'bomber': {
    points: 3,
    params: [],
  },
  'knight': {
    points: 3,
    params: [],
  },
  'ranger': {
    points: 3,
    params: [],
  },
  'teleporter': {
    points: 3,
    // onCapture :: (Piece, Piece, Piece, Game) -> Game
    onCapture: curry(function(oldPiece, piece, capturedPiece, game) {
      check(arguments, [Piece, Piece, Piece, Game]);
      return Game.of(evolve({
        board: addPieceToBoard(Piece.of(evolve({
                 position: always(oldPiece.position),
                 asleep: always(true)
               }, capturedPiece)))
      }, game));
    }),
    params: [],
  },
  'bloodlust': {
    points: 3,
    // onCapture :: (Piece, Piece, Piece, Game) -> Game
    onCapture: curry(function(oldPiece, piece, capturedPiece, game) {
      check(arguments, [Piece, Piece, Piece, Game]);
      return Game.of(evolve({
        board: compose(
          Board.of,
          evolve({
            pieces: adjust(
              compose(
                Piece.of,
                evolve({
                  parlett: map(evolve({ distance:
                    compose(
                      add(''),
                      add(1),
                      parseInt
                    )
                  }))
                })
              ),
              indexOf(piece, game.board.pieces))
          })// evolve
        )// compose
      }, game));
    }),
    params: [],
  },
  'labor': {
    points: 2,
    use: function(game) {
      var turnIndex = colorToIndex(game.turn);
      //var fn = game.plysLeft[turnIndex] === game.plysPerTurn[turnIndex] ?
        //adjust(add(1), turnIndex) :
        //identity;

      return Game.of(evolve({
        plysLeft: adjust(add(2), turnIndex)
      }, game));
    },
  },
  'mine': {
    points: 4,
    continuingEffect: function(game) {
      //TODO: use integer
      var playerIndex = colorToIndex(game.turn);
      return Game.of(evolve({
        resources: adjust(compose(min(game.maxResources[playerIndex]), add(1)), playerIndex) // Add one to resources of same color as piece.
      }, game));
    },
    params: [],
  },
  'wall': {
    points: 4,
    params: [],
  },
  'thief': {
    points: 4,
    // onCapture :: (Piece, Piece, Game) -> Game
    onCapture: curry(function(oldPiece, piece, capturedPiece, game) {
      var index = piece.color === 'white' ? 0 : 1;
      return Game.of(evolve({
        resources: adjust(compose(min(game.maxResources[index]), add(capturedPiece.points)), index)
      }, game));
    }),
    params: [],
  },
  //'refund': {
    //points: 0,
    //use: function(game, params) {
      //// params[0]: Card in-hand to trash for gold.
      //var playerIndex = colorToIndex(game.turn);
      //var card = params[0]
      //return Game.of(evolve({
        //hands: adjust(remove(card, 1), playerIndex),
        //resources: adjust(
          //// TODO: extract to Util
          //compose(
           //min(game.maxResources[playerIndex]),
           //add(game.hands[playerIndex][card].points)
          //),
          //playerIndex
        //)
      //}, game));
    //},
    //requiredInput: ['card'],
    //// (Board, Color) -> [Integer]
    ////params: 
  //},
  'investment': {
    points: 5,
    use: function(game) {
      // TODO: use integer
      var playerIndex = colorToIndex(game.turn);
      return Game.of(evolve({
        resources: adjust(
          // TODO: extract to Util
          compose(
           min(game.maxResources[playerIndex]),
           add(9)
          ),
          playerIndex
        )
      }, game));
    },
  },
  'rook': {
    points: 5,
    params: [],
  },
  'church and state': {
    points: 5,
    use: curry(function(game) {
      return Game.of(evolve({
        board: compose(Board.of, evolve({
          pieces: map(function(piece) {
            var parlett = {movement: '1/0', distance: '1'};
            if (piece.color === game.turn &&
                contains('pious', piece.types) &&
                not(contains(parlett, piece.parlett))) {
              return Piece.of(evolve({
                parlett: append(parlett)
              }, piece));
            } else {
              return piece
            }
          })
        }))
      }, game));
    }),
  },
  'demotion': {
    points: 5,
    use: curry(function(game, positions) {
      var index = indexOf(positions[0], map(prop('position'), game.board.pieces));
      return Game.of(evolve({
        board: compose(Board.of, evolve({
          pieces: adjust(function(piece) {
            return Piece.of({
              name: 'pawn',
              color: piece.color,
              position: piece.position,
              asleep: piece.asleep,
            });
          }, index),
        }))
      }, game));
    }),
    // (Board, Color) -> [Position]
    params: compose(positionsOfPieces, notRoyal, allPieces),
  },
  'king': {
    points: 7,
    params: [],
  },
  'archbishop': {
    points: 7,
    params: [],
  },
  'empress': {
    points: 8,
    params: [],
  },
  'queen': {
    points: 9,
    params: [],
  },
  'mind control': {
    points: 12,
    use: curry(function(game, positions) {
      var index = indexOf(positions[0], map(prop('position'), game.board.pieces));
      return Game.of(evolve({
        board: compose(Board.of, evolve({
          pieces: adjust(function(piece) {
            return Piece.of(evolve({
              color: (color) => { return color === 'white' ? 'black' : 'white'; },
              asleep: always(true),
            }, piece));
          }, index),
        }))
      }, game));
    }),
    // (Board, Color) -> [Position]
    params: compose(positionsOfPieces, notRoyal, opponentsPieces),
  },
  ///////// Custom pieces //////////
  //'warlord': {
    //points: 12,
    //params: [],
  //},
  //'cannon': {
    //points: 9,
    //params: [],
  //},
  ////////// Fairies //////////
  //'berolina': {
    //points: 1,
    //params: [],
  //},
  //'dabbaba': {
    //points: 2,
    //params: [],
  //},
  //'alfil': {
    //points: 2,
    //params: [],
  //},
  //'wazir': {
    //points: 2,
    //params: [],
  //},
  //'ferz': {
    //points: 1,
    //params: [],
  //},
  //'nightrider': {
    //points: 6,
    //params: [],
  //},
};
