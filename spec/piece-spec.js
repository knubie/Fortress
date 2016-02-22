var R        = require('ramda');
var Board    = require('../engine/Types').Board;
var Game    = require('../engine/Types').Game;
var Piece    = require('../engine/Types').Piece;
var Position = require('../engine/Types').Position;
var Chess    = require('../engine/Main.js')
for (k in R) {
  var topLevel = typeof global === 'undefined' ? window : global;
  topLevel[k] = R[k];
}

var board = new Board({
  size: 8,
  pieces: [
    new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 4, y: 4})
    })
  ],
});

// :: ([position], [position], Number) -> Boolean
var compare = function(arr1, arr2, i) {
  var i = i || 0;
  var position = arr1[i];
  if (arr1.length === 0 && arr2.length === 0) { return true; }
  if ( any(equals(position), arr2) ) { 
    if (i === arr1.length - 1 && arr2.length === 1) {
      return true;
    } else {
      return compare(arr1, remove(indexOf(position, arr2), 1, arr2), i + 1);
    }
  } else {
    return false
  }
}

describe('Pieces', function() {
  it('Teleporter should swap pieces with friendly pieces', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'teleporter',
          color: 'white',
          position: new Position({x: 3, y: 3})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'teleporter',
          color: 'white',
          position: new Position({x: 4, y: 4}),
          moves: 1
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 3, y: 3})
        })
      ],
    });
    var actualBoard = Chess.movePiece(
      Position.of({x: 3, y: 3}), Position.of({x: 4, y: 4}),
      game).board;
    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });
  it('Bomber should remove any piece at it\s position when captured.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 3, y: 1})
        }),
        new Piece({
          name: 'knight',
          color: 'black',
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualBoard = Chess.movePiece(
        Position.of({x: 2, y: 3}), Position.of({x: 3, y: 1}),
        game).board;
    var expectedBoard = new Board({
      size: 8,
      pieces: [ ],
    });
    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });
  it('Bomber should not blow up pieces when moving to an empty square', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 3, y: 1})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualGame = Chess.makePly('move', game, {
      startingPosition: Position.of({x: 3, y: 1}),
      targetPosition: Position.of({x: 3, y: 2})
    });
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 3, y: 2}),
          moves: 1
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    expect(equals(expectedBoard, actualGame.board)).toBe(true);
  });
  it('Bomber ability should blow up surrounding pieces', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          position: new Position({x: 3, y: 1})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 3, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualGame = Chess.abilityPly(board.pieces[4], game);
    //var actualGame = Chess.makePly('ability', game, {
      //startingPosition: Position.of({x: 3, y: 1})
    //});
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'knight',
          color: 'black',
          position: new Position({x: 2, y: 3})
        })
      ],
    });
    expect(equals(expectedBoard, actualGame.board)).toBe(true);
  });
  it('The mine\'s ability should add one resource to the players resources.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'mine',
          color: 'white',
          position: new Position({x: 4, y: 4})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      resources: [8, 8],
      board: board
    });
    var actualGame = Chess.makePly('ability', game, {
      startingPosition: Position.of({x: 4, y: 4})
    });
    expect(actualGame.resources[0]).toBe(10);
  });
  it('Gold should not exceed MAX_GOLD', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'mine',
          color: 'white',
          position: new Position({x: 4, y: 4})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      resources: [10, 10],
      board: board
    });
    var actualGame = Chess.makePly('ability', game, {
      startingPosition: Position.of({x: 4, y: 4})
    });
    expect(actualGame.resources[0]).toBe(10);
  });
  it('A wall cannot be captured', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'wazir',
          color: 'white',
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'wall',
          color: 'black',
          position: new Position({x: 2, y: 1})
        }),
      ],
    });
    var actualMoves = Chess.getMoves(board, board.pieces[0]);
    var expectedMoves = [
      {x: 1, y: 0 },
      {x: 3, y: 0 },
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });
  it('Bloodlust\'s movement should increase after every capture', function() {
    var board = new Board({
      size: 8,
      pieces: [
        Piece.of({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        Piece.of({
          name: 'bloodlust',
          color: 'black',
          position: Position.of({x: 3, y: 4})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualBoard = Chess.movePiece(board.pieces[1].position, board.pieces[0].position, game).board;
    expect(actualBoard.pieces[0].parlett[0].distance).toBe('2');
  });
  it('Thief should gain 1 less gold than it\'s captured piece\'s worth', function() {
    var board = new Board({
      size: 8,
      pieces: [
        Piece.of({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        Piece.of({
          name: 'rook',
          color: 'black',
          position: Position.of({x: 3, y: 4})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [0, 0]
    });
    var actualGame = Chess.movePiece(board.pieces[0].position, board.pieces[1].position, game);
    expect(actualGame.resources[0]).toBe(4);
  });
  it('Steal card should steal 2 gold from opponent and give to player', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [4, 7],
      hands: [['steal'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(6);
    expect(newGame.resources[1]).toBe(5);
  });
  it('Steal card should not steal more gold than the opponent has.', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [4, 1],
      hands: [['steal'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(5);
    expect(newGame.resources[1]).toBe(0);
  });
});