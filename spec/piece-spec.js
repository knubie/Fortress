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
          asleep: false,
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 1})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          asleep: false,
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualGame = Chess.movePly(
      board.pieces[4],
      Position.of({x: 3, y: 2}),
      game
    );
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 2}),
          moves: 1
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          asleep: false,
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
          asleep: false,
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 0})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'bomber',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 1})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 1})
        }),


        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 3, y: 2})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 2})
        }),



        new Piece({
          name: 'knight',
          color: 'black',
          asleep: false,
          position: new Position({x: 2, y: 3})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualGame = Chess.abilityPly(board.pieces[4], game);
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'knight',
          color: 'black',
          asleep: false,
          position: new Position({x: 2, y: 3})
        })
      ],
    });
    expect(equals(expectedBoard, actualGame.board)).toBe(true);
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
    var actualGame = Chess.abilityPly(board.pieces[0], game);
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
  it('Church and State card should give +1(1/0) to all friendly Pious units on the board.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'bishop',
          color: 'white',
          position: new Position({x: 4, y: 2})
        }),
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [5, 1],
      hands: [['church and state'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(R.contains({
      movement: '1/0',
      distance: '1',
    }, newGame.board.pieces[0].parlett)).toBe(true);
    expect(R.contains({
      movement: '1/0',
      distance: '1',
    }, newGame.board.pieces[1].parlett)).toBe(true);
    expect(R.not(R.contains({
      movement: '1/0',
      distance: '1',
    }, newGame.board.pieces[2].parlett))).toBe(true);
  });
  it('Fortify should make a piece invincible for one turn.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'bishop',
          color: 'white',
          position: new Position({x: 4, y: 2})
        }),
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [4, 1],
      hands: [['fortify'], ['perception']],
      decks: [[],[]],
      plysLeft: 1,
    });

    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 4})]
    }, game);



    expect(R.contains(
      'Invincible until the end of the next turn.',
      newGame.board.pieces[0].additionalEffects
    )).toBe(true);
    expect(R.contains(
      'invincible',
      newGame.board.pieces[0].types
    )).toBe(true);


    var newGame = Chess.movePly(
      newGame.board.pieces[2],
      Position.of({x: 5, y: 6}),
      newGame
    );
    var newGame = Chess.useCardPly('black', 0, {}, newGame);

    expect(R.not(R.contains(
      'Invincible until the end of the next turn.',
      newGame.board.pieces[0].additionalEffects
    ))).toBe(true);
    expect(R.not(R.contains(
      'invincible',
      newGame.board.pieces[0].types
    ))).toBe(true);
  });
  it("Mind Control should allow a player to take control of an opponent's piece.", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['mind control'], []],
      decks: [[],[]],
      plysLeft: 2,
    });

    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 5})]
    }, game);

    expect(newGame.board.pieces[0].color).toBe('white');

    var newGame2 = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 5, y: 6}),
                                newGame);

    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("Demotion should change a piece into a pawn", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['demotion'], []],
      decks: [[],[]],
      plysLeft: 2,
    });

    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 5})]
    }, game);

    expect(newGame.board.pieces[0].name).toBe('pawn');
  });
});




















