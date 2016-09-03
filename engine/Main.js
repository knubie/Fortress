var R        = require('ramda');
var check    = require('./lib/type-checker').checkAll;
var Util     = require('./Util');
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
for (var k in Util) {
  var topLevel = typeof global === 'undefined' ? window : global;
  topLevel[k] = Util[k];
}

var PLYS_PER_TURN = 2;

var concatAll = unapply(reduce(concat, []));

var shuffle = function(arr) {
  var array = arr.slice(0);
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

//  between :: (Number, Number) -> [Number]
var between = curry(function(start, end) {
  check(arguments, [Number, Number]);
  return start < end ? range(start + 1, end) : range(end + 1, start);
});

//  isCapturable :: (Maybe(Piece)) -> Boolean
var isCapturable = curry(function(piece) {
  // FIXME: add Maybe support
  return not(contains('invincible', prop('types', piece || {types: []})));
});

//  move :: (Number, Number, String, String, Board, Piece) -> [Position]
var move = curry(function(distance1, distance2, numMoves, direction, board, piece) {
  check(arguments, [Number, Number, String, String, Board, Piece]);
  var oppositeColor = piece.color === 'white' ? 'black' : 'white';

  // TODO: Add support for x(n/n).

  //distance = distance === 'n' ? board.size - 1 : parseInt(distance);
  var forwards = direction === 'forwards';
  var backwards = direction === 'backwards';
  var sideways = direction === 'sideways';
  var white = piece.color === 'white';
  var black = not(white);

  return uniq(filter(identity, flatten(
    map(function(fns) {
      var i = 1;
      var fn = function(pos) {
        var p = Position.of(evolve({
          x: fns[0],
          y: fns[1]
        }, pos));
        var wrongDirection = ((((forwards && white) || (backwards && black)) && (p.y <= piece.position.y)) ||
          (((backwards && white) || (forwards && black)) && (p.y >= piece.position.y))  ||
          (sideways && (p.y !== piece.position.y)))
        if (legalPosition(board, p) &&
            !wrongDirection &&
            !getPieceAtPosition(board, piece.color, p) &&
            isCapturable(getAnyPieceAtPosition(board, p))) {
          if (getPieceAtPosition(board, oppositeColor, p)) {
            return p;
          } else {
            if (numMoves === 'n' || i < parseInt(numMoves)) {
              i = i + 1;
              return [p, fn(p)];
            } else {
              return p;
            }
          }
        } else {
          return null;
        }
      };
      return fn(piece.position);
    }, [
      [add(distance1),          add(distance2)],
      [add(distance2),          add(distance1)],
      [subtract(__, distance1), subtract(__, distance2)],
      [subtract(__, distance2), subtract(__, distance1)],
      [add(distance1),          subtract(__, distance2)],
      [add(distance2),          subtract(__, distance1)],
      [subtract(__, distance1), add(distance2)],
      [subtract(__, distance2), add(distance1)]
    ])
  )));
});

//  legalPosition :: (Board, Position) -> Boolean
var legalPosition = curry(function(board, position) {
  check(arguments, [Board, Position]);
  return position.x >= 0 && position.x < board.size && position.y >= 0 && position.y < board.size;
});

//  getCardUsePositions :: (Board, String, String) -> [Position]
var getCardUsePositions = curry(function(board, card, color) {
  // TODO: use this to check UseCardPly params
  if (Pieces[card]) {
    // TODO: rewrite this, baking into the Pieces.js
    var moves = [];
    if (color === 'white') {
      var yStart = 0;
      var yEnd = 1;
      // TODO bake this into Pieces.js
      if (card === 'pawn' ||
          card === 'berolina' ||
          card === 'wall' ||
          card === 'ferz' ||
          card === 'wazir') {
        var yEnd = 2;
      }
      moves = flatten(map(function(y) {
        return map(function(x) {
          return Position.of({x: x, y: y});
        }, range(0, board.size));
      }, range(yStart, yEnd)));
    } else {
      var yStart = board.size;
      var yEnd = board.size - 1;
      if (card === 'pawn' ||
          card === 'berolina' ||
          card === 'wall' ||
          card === 'ferz' ||
          card === 'wazir') {
        var yEnd = board.size - 2;
      }
      moves = flatten(map(function(y) {
        return map(function(x) {
          return Position.of({x: x, y: y});
        }, range(0, board.size));
      }, range(yEnd, yStart)));
    }
    return reject(getAnyPieceAtPosition(board), moves);
  } else {
    if (Cards[card].params != null) {
    //if (path([card, 'useagePositions'], pieceCallbacks)) {
      return Cards[card].params(board, color);
      //return pieceCallbacks[card].useagePositions(color, board);
    } else {
      return null;
    }
  }
});

//unoccupied(firstRow(board))

//unoccupied = reject(getAnyPieceAtPosition(board));

//firstRow = (board) => {
  //var y = color === 'white' ? 0 : board.size;
  //return map(function(x) {
    //return Position.of({x: x, y: y});
  //}, range(0, board.size));
//}

//firstTwoRows = (board) => {
  //var yRange = color === 'white' ? range(0, 2) : range(board.size - 2, board.size);
  //return flatten(map(function(y) {
    //return map(function(x) {
      //return Position.of({x: x, y: y});
    //}, range(0, board.size));
  //}, yRange));
//}


//  getMoves :: (Board, Piece) -> [Position]
var getMoves = curry(function(board, piece) {
  check(arguments, [Board, Piece]);
  var oppositeColor = piece.color === 'white' ? 'black' : 'white';
  var initial = function(p) {
    return contains('i', or(p.conditions, [])) && parseInt(piece.moves) > 0;
  };

  if (customMovement[piece.name]) {
    return customMovement[piece.name](board, piece);
  } else {
    return uniq(flatten(map(function(p) {
      var d = map(parseInt, p.movement.match(/(\d)\/(\d)/));
      var direction = p.direction || 'any';
      var results = move(d[1], d[2], p.distance, direction, board, piece);
      if (contains('c', or(p.conditions, []))) {
        return filter(getPieceAtPosition(board, oppositeColor), results);
      } else if (contains('o', or(p.conditions, []))) {
        return reject(getPieceAtPosition(board, oppositeColor), results);
      } else {
        return results;
      }
    }, reject(initial, piece.parlett))));
  }
});

//  getCaptures :: (Board, Piece) -> [Position]
var getCaptures = curry(function(board, piece) {
  check(arguments, [Board, Piece]);
  var color = piece.color === 'white' ? 'black' : 'white';
  return filter(getPieceAtPosition(board, color), getMoves(board, piece));
});

//  getDefends :: (Board, Piece) -> [Position]
var getDefends = curry(function(board, piece) {
  check(arguments, [Board, Piece]);
  var color = piece.color === 'white' ? 'black' : 'white';
  return filter(getPieceAtPosition(board, piece.color), getMoves(board, Piece.of(evolve({color: always(color)}, piece))));
});

var pieceCallbacks = {
  bomber: {
    ability: curry(function(piece, game) {
      var surroundingSquares = [
        piece.position,
        Position.of({x: piece.position.x, y: piece.position.y - 1}),
        Position.of({x: piece.position.x + 1, y: piece.position.y - 1}),
        Position.of({x: piece.position.x + 1, y: piece.position.y}),
        Position.of({x: piece.position.x + 1, y: piece.position.y + 1}),
        Position.of({x: piece.position.x, y: piece.position.y + 1}),
        Position.of({x: piece.position.x - 1, y: piece.position.y + 1}),
        Position.of({x: piece.position.x - 1, y: piece.position.y}),
        Position.of({x: piece.position.x - 1, y: piece.position.y - 1}),
      ];
      return Game.of(evolve({
        board: compose(
                 Board.of,
                 evolve({
                   pieces: reject(
                             compose(
                               any(__, surroundingSquares),
                               equals,
                               prop('position')))
                 })
               )
      }, game));
    }),
    onCaptured: curry(function(piece, board) {
      // Removes any piece on the square of the captured piece.
      // piece = the captured piece.
      // TODO: Change getMoves to actual blast radius.
      return Board.of(evolve({
        pieces: reject(propEq('position', piece.position))
      }, board));
    })
  },
  library: {
    // +2 cards
    ability: curry(function(piece, game) {
      var index = colorToIndex(piece.color);
      return compose(
        drawCard(game.turn),
        drawCard(game.turn)
      )(game)
    }),
  },
  factory: {
    // +1 card, +1 gold
    ability: curry(function(piece, game) {
      var index = colorToIndex(piece.color);
      return compose(
        addResources(__, index, 1),
        drawCard(game.turn)
      )(game)
    }),
  },
  king: {
    // TAX
    // Add one resource per pawn, or one
    ability: curry(function(piece, game) {
      var index = colorToIndex(piece.color);
      //var amount = filter(where({
        //color: equals(piece.color),
        //name: equals('mine'),
      //}), game.board.pieces).length * 2;
      return addResources(game, index, 1);
    }),
  },
  mine: {
    ability: curry(function(piece, game) {
      var index = piece.color === 'white' ? 0 : 1;
      return Game.of(evolve({
        resources: adjust(compose(min(game.maxResources[index]), add(1)), index) // Add one to resources of same color as piece.
      }, game));
    }),
    afterEveryPly: curry(function(game, piece) {
      //TODO: use integer
      var index = colorToIndex(piece.color);
      return Game.of(evolve({
        resources: adjust(compose(min(game.maxResources[index]), add(1)), index) // Add one to resources of same color as piece.
      }, game));
    })
  },
};

var customMovement = {
  'teleporter': function(board, piece) {
    // Get all squares
    var positions = flatten(map(function(x) {
      return map(function(y) {
        return Position.of({x:x, y:y});
      }, range(0, board.size))
    }, range(0, board.size)));
    // Filter squares that don't have pieces, or have a piece of the same color.
    // TODO: filter out current piece's position as well.
    return filter(function(pos) {
      var p = getAnyPieceAtPosition(board, pos)
      return (not(p) || (not(equals(p, piece)) &&
              prop('color', p || {color: null}) === piece.color));
    }, positions);
  },
  'bloodlust': function(board, piece) {
    var oppositeColor = piece.color === 'white' ? 'black' : 'white';
    // Change all piece colors to oppositeColor so we can capture friendly pieces.
    var newBoard = Board.of(evolve({
      pieces: map(function(piece) {
        return Piece.of(evolve({
          color: always(oppositeColor)
        }, piece));
      })
    }, board));
    var initial = function(p) {
      return contains('i', or(p.conditions, [])) && parseInt(piece.moves) > 0;
    };

    return uniq(flatten(map(function(p) {
      var d = map(parseInt, p.movement.match(/(\d)\/(\d)/));
      var direction = p.direction || 'any';
      var results = move(d[1], d[2], p.distance, direction, newBoard, piece);
      if (contains('c', or(p.conditions, []))) {
        return filter(getPieceAtPosition(newBoard, oppositeColor), results);
      } else if (contains('o', or(p.conditions, []))) {
        return reject(getPieceAtPosition(newBoard, oppositeColor), results);
      } else {
        return results;
      }
    }, reject(initial, piece.parlett))));
  },
}

//  endTurn :: (PlyType, Game) -> Game
var endTurn = curry(function(ply, game) {
  var turnIndex = colorToIndex(game.turn);
  var newGame = Game.of(evolve({
    board: compose(
      Board.of,
      evolve({
        pieces: map(function(piece) {
          if (typeof piece.afterTurn === 'function' && game.plysLeft[turnIndex] === 1) {
            return piece.afterTurn(Piece.of(assoc('asleep', false, piece)));
          } else {
            // Put Piece to sleep.
            if (game.plysLeft[turnIndex] === 1 && piece.asleep) {
              return Piece.of(assoc('asleep', false, piece));
            } else {
              if (contains(ply.type, ['AbilityPly', 'MovePly'])
              && (equals(ply.piece, piece) ||
                  eqProps('position', ply, piece))) {
                return Piece.of(assoc('asleep', true, piece));
              } else {
                return piece;
              }
            }
          }
        })
      })
    ),
    turn: (turn) => {
      if (game.plysLeft[turnIndex] === 1) {
        return turn === 'white' ? 'black' : 'white';
      } else {
        return turn;
      }
    },
    plysLeft: (plysLeft) => {
      if (plysLeft[turnIndex] === 1) {
        return adjust(
          always(game.plysPerTurn[turnIndex]),
          turnIndex,
          plysLeft);
      } else {
        return adjust(
          subtract(__, 1),
          turnIndex,
          plysLeft);
      }
    },
    plys: append(ply)
  }, game));
  if (newGame.turn !== game.turn) {
    //newGame = drawCard(newGame.turn, newGame);
    newGame = reduce(function(game, piece) {
      if (piece.color === game.turn && typeof Cards[piece.name].continuingEffect === 'function') {
        return Cards[piece.name].continuingEffect(game);
      } else {
        return game;
      }
    }, newGame, newGame.board.pieces);
    return reduce(flip(call), newGame, newGame.afterTurn);
  } else {
    return newGame;
  }
});

//  drawCardPly :: (String, Game) -> Game
var drawCardPly = curry(function(color, game) {
  check(arguments, [String, Game]);
  // TODO: replace with integer
  var playerIndex = color === 'white' ? 0 : 1;
  var randomIndex = Math.floor(Math.random() * game.decks[playerIndex].length);
  if (not(equals(color, game.turn))) {
    return message('It\'s not your turn!', game);
  } else {
    var newGame = drawCard(color, game);
    if (!newGame.message) {
      return endTurn(Types.DrawPly.of(), newGame);
    } else { return newGame }
  }
});

//  movePly :: (Piece, Position, Game) -> Game
var movePly = curry(function(piece, position, game) {
  check(arguments, [Piece, Position, Game]);
  var piece = find(eqProps('position', piece), game.board.pieces);
  if (equals(piece.position, position) ||
      // movePiece() already makes this check, any way we can prevent
      // calling it again?
      not(contains(position, getMoves(game.board, piece)))) {
    return game;
  } else if (not(equals(piece.color, game.turn))) {
    return message('It\'s not your turn!', game);
  //} else if (game.plysLeft < PLYS_PER_TURN && last(game.plys).type === 'MovePly') {
    //return message("You can't move twice in one turn!", game);
  } else if (piece.asleep) {
    return message("You must wait until the next turn to use this piece.", game);
  } else {
    var newGame = game;
    if (typeof piece.afterMove === 'function') {
      newGame = piece.afterMove(piece, game);
    }
    var newGame = movePiece(piece.position, position, newGame);
    if (newGame) {
      return endTurn(
          Types.MovePly.of({piece, position}),
          newGame);
    } else {
      return game;
    }
  }
});

// (Number)
var useCardPly = curry(function(color, card, params, game) {
  // TODO: replace with integer
  var playerIndex = colorToIndex(game.turn);
  var {positions, pieces, cards} = params;
  if (not(equals(color, game.turn))) {
    return message('It\'s not your turn!', game);
  } else {
    // TODO: rewrite this, check valid squares
    // Create a card lookup with:
    // points needed,
    // params needed
    // action (draft, etc.)
    // Write tests
    var name = game.hands[playerIndex][card];
    if (Cards[name].points <= game.resources[playerIndex]) {
      var newGame = Game.of(evolve({
        hands: adjust(remove(card, 1), playerIndex),
        resources: adjust(subtract(__, Cards[name].points), playerIndex)
      }, game));
      if (Cards[name].use != null) {
        newGame = Cards[name].use(newGame, positions);
      //if (pieceCallbacks[name] && pieceCallbacks[name].use != null) {
        //newGame = pieceCallbacks[name].use(newGame, positions)
      } else {
        var piece = Piece.of({
          color: color,
          name: game.hands[playerIndex][card],
          position: positions[0],
        });
        newGame = Game.of(evolve({
          board: addPieceToBoard(piece),
        }, newGame));
      }
      if (newGame) {
        return endTurn(Types.UseCardPly.of({card, params}), newGame);
      }
    } else {
      return message('Not enough gold!', game);
    }
  }
});

var abilityPly = curry(function(piece, game) {
  if (not(equals(piece.color, game.turn))) {
    return message('It\'s not your turn!', game);
  } else if (piece.asleep) {
    return message("You must wait until the next turn to use this piece.", game);
  } else if (typeof path([piece.name, 'ability'], pieceCallbacks) === 'function') {
    var newGame = pieceCallbacks[piece.name].ability(piece, game);
    return endTurn(
        Types.AbilityPly.of({piece}),
        newGame);
  } else {
    return game;
  }
});

//  movePiece :: (Position, Position, Game) -> Maybe Game
var movePiece = curry(function(startingPosition, targetPosition, game) {
  check(arguments, [Position, Position, Game]);

  var board = game.board
  var piece = getAnyPieceAtPosition(board, startingPosition);
  var capturedPiece = getAnyPieceAtPosition(board, targetPosition);
  var newPosition = always(targetPosition);
  if (capturedPiece && contains('ranged', piece.types)) {
    newPosition = always(startingPosition);
  }

  var onCapture = capturedPiece &&
                  Cards[piece.name].onCapture ||
                  //path([piece.name, 'onCapture'], pieceCallbacks) ||
                  curry(function(oldPiece, piece, capturedPiece, game) { return game; });
  // TODO: is equality check appropriate?
  var onCaptured = capturedPiece && capturedPiece.color !== piece.color &&
                   path([capturedPiece.name, 'onCaptured'], pieceCallbacks) ||
                   curry(function(piece, board) { return board; });

  if (contains(targetPosition, getMoves(board, piece))) {
    var newPiece = Piece.of(evolve({
      position: newPosition,
      moves: add(1),
    }, piece));
    var newBoard = Board.of(evolve({
      pieces: compose(
                reject(equals(capturedPiece)),
                adjust(
                  always(newPiece),
                  indexOf(piece, board.pieces)))
    }, board));
    var newGame = Game.of(evolve({
      board: always(newBoard)
    }, game));
    return Game.of(evolve({
      board: onCaptured(capturedPiece)
    }, onCapture(piece, newPiece, capturedPiece, newGame)));
    //return compose(
      //onCaptured(capturedPiece),
      //onCapture(piece, newPiece, capturedPiece)
    //)(newBoard);
  } else {
    return null;
  }
});

//  isGameOver :: (Board, String) -> Boolean
var isGameOver = curry(function(board, color) {
  check(arguments, [Board, String]);
  //TODO: check position.
  return not(any(where({
                   color: equals(color),
                   types: contains('royal')
                 }), board.pieces));
});

// draftPiece :: (Piece, Game) -> Maybe Game
var draftPiece = curry(function(piece, game) {
  check(arguments, [Piece, Game]);
  var index = piece.color === 'white' ? 0 : 1;

  if (piece.points <= game.resources[index]) {
    return Game.of(evolve({
      board: addPieceToBoard(piece),
      hands: adjust(remove(opts.card, 1), color),
      //board: compose(
               //Board.of,
               //evolve({
                 //pieces: adjust(
                   //compose(
                     //Piece.of,
                     //evolve({
                       //position: always(position)
                     //})
                   //), indexOf(piece, game.board.pieces)
                 //)
               //})
             //),
      resources: adjust(subtract(__, piece.points), index)
    }, game));
  } else {
    // TODO return message.
    return null;
  }
});

//  makePly :: (Game, Ply) -> Game
var makePly = function(game, ply) {
  check(arguments, [Game]);
  if (ply.type === 'MovePly') {
    return movePly(
      Piece.of(R.evolve({position: Position.of}, ply.piece)),
      Position.of(ply.position),
      game);
  } else if (ply.type === 'DrawPly') {
    return drawCardPly(game.turn, game);
  } else if (ply.type === 'AbilityPly') {
    return abilityPly(
      Piece.of(R.evolve({position: Position.of}, ply.piece)),
      game);
  } else if (ply.type === 'UseCardPly') {
    return useCardPly(game.turn, ply.card, {
      positions: R.map(Position.of, ply.params.positions || [])
    }, game);
  } else { // draft
    return Game.of(R.evolve({
      // TODO: change to integer.
      turn: (turn) => { return turn === 'white' ? 'black' : 'white'; },
      plys: R.append('draft'),
    }, game));
    //return game;
  }
}

//  getGameFromPlys :: (Game, [Ply]) -> Game
var getGameFromPlys = R.reduce(makePly);

module.exports = {
  movePiece,
  getMoves,
  getCaptures,
  getDefends,
  addPiece,
  getPieceAtPosition,
  getAnyPieceAtPosition,
  colorToIndex,
  isGameOver,
  draftPiece,
  drawCardPly,
  useCardPly,
  movePly,
  abilityPly,
  shuffle,
  getCardUsePositions,
  makePly,
  getGameFromPlys,
};
