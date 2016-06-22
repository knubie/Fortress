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
  it('King\'s Tax ability should add one gold', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'king',
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
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [2, 2],
    });
    var actualGame = Chess.abilityPly(board.pieces[0], game);
    expect(actualGame.resources[0]).toBe(3);
  });
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
          asleep: true,
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
  it('Gold should not exceed maxResources', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'king',
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
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [9, 2],
    });
    var actualGame = Chess.abilityPly(board.pieces[0], game);
    expect(actualGame.resources[0]).toBe(actualGame.maxResources[0]);
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
  it('Bloodlust should be able to capture friendly pieces.', function() {
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
          color: 'white',
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
  it('Shapeshifter should change into whatever piece is captures', function() {
    var board = new Board({
      size: 8,
      pieces: [
        Piece.of({
          name: 'shapeshifter',
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
    var actualBoard = Chess.movePiece(board.pieces[0].position, board.pieces[1].position, game).board;
    expect(actualBoard.pieces[0].name).toBe('bloodlust');
    expect(actualBoard.pieces[0].color).toBe('white');
  });
  it('Thief should gain equal to captured piece\'s worth', function() {
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
    expect(actualGame.resources[0]).toBe(5);
  });
  it('Steal card should steal 2 gold from opponent and give to player', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 3})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [4, 9],
      hands: [['steal'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(7);
    expect(newGame.resources[1]).toBe(6);
  });
  it('Steal card should not steal more gold than the opponent has.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 3})
        })
      ],
    });
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
  it('Steal card should not exceed maxResources', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'thief',
          color: 'white',
          position: new Position({x: 4, y: 3})
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [9, 4],
      hands: [['steal'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(newGame.maxResources[0]);
    expect(newGame.resources[1]).toBe(1);
  });
  it('Foreign Aid should give the player 3 gold', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [5, 4],
      hands: [['foreign aid'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(8);
  });
  it('Foreign Aid should not exceed maxResources', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [9, 4],
      hands: [['foreign aid'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(newGame.maxResources[0]);
  });
  it('Investment should give the player 4 gold', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [5, 4],
      hands: [['investment'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(9);
  });
  it('Investment should not exceed maxResources', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [7, 4],
      hands: [['investment'], []],
      decks: [[],[]],
    });
    var newGame = Chess.useCardPly('white', 0, { }, game);
    expect(newGame.resources[0]).toBe(newGame.maxResources[0]);
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
      plysLeft: [1, 2],
    });

    // Use Fortify card
    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 4})]
    }, game);



    // Check Types array and additionalEffects array on piece.
    expect(R.contains(
      'Invincible until the end of the next turn.',
      newGame.board.pieces[0].additionalEffects
    )).toBe(true);
    expect(R.contains(
      'invincible',
      newGame.board.pieces[0].types
    )).toBe(true);


    // Black takes their turn.
    var newGame = Chess.movePly(
      newGame.board.pieces[2],
      Position.of({x: 5, y: 6}),
      newGame
    );
    var newGame = Chess.useCardPly('black', 0, {}, newGame);

    // White's piece should no longer be fortified.
    expect(R.not(R.contains(
      'Invincible until the end of the next turn.',
      newGame.board.pieces[0].additionalEffects
    ))).toBe(true);
    expect(R.not(R.contains(
      'invincible',
      newGame.board.pieces[0].types
    ))).toBe(true);

    var expectedGame = Chess.getGameFromPlys(game, JSON.parse(JSON.stringify(newGame.plys)));

    expect(R.not(R.contains(
      'Invincible until the end of the next turn.',
      expectedGame.board.pieces[0].additionalEffects
    ))).toBe(true);
    expect(R.not(R.contains(
      'invincible',
      expectedGame.board.pieces[0].types
    ))).toBe(true);



  });
  it('Pin should penalize a piece of moving.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 4})
        }),
      ],
    });

    var game = new Game({
      turn: 'white',
      board: board,
      resources: [4, 1],
      hands: [['pin'], ['perception']],
      decks: [['pawn', 'pawn', 'pawn', 'pawn', 'pawn'],['pawn', 'pawn', 'pawn', 'pawn']],
      plysLeft: [1, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 4})]
    }, game);

    expect(R.contains('pinned', newGame.board.pieces[0].types)).toBe(true);

    var newGame = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 5, y: 5}),
                                newGame);

    var newGame = Chess.drawCardPly('black', newGame);

    // Effect should trigger after moving the piece.
    expect(newGame.hands[0].length).toBe(3);
    expect(newGame.resources[0]).toBe(6);
    expect(R.contains('pinned', newGame.board.pieces[0].types)).toBe(false);

    var expectedGame = Chess.getGameFromPlys(game, newGame.plys);

    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);

    var newGame = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 4, y: 4}),
                                newGame);

    // Effect should not trigger again when the piece is moved again.
    expect(newGame.hands[0].length).toBe(5);
    expect(newGame.resources[0]).toBe(6);

    var expectedGame = Chess.getGameFromPlys(game, JSON.parse(JSON.stringify(newGame.plys)));

    expect(expectedGame.hands[0].length).toBe(5);
    expect(expectedGame.resources[0]).toBe(6);

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
      resources: [12, 1],
      maxResources: [15, 10],
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
  it("Demotion params test", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 0, y: 5})
        }),
        new Piece({
          name: 'king',
          color: 'black',
          position: new Position({x: 1, y: 5})
        }),
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

    var useagePositions = Chess.getCardUsePositions(board, 'demotion', game.turn);
    expect(compare(useagePositions, [
      Position.of({x:4, y:5}),
      Position.of({x:0, y:5}),
    ])).toBe(true);
  });
  it("Mind Control params test", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'black',
          position: new Position({x: 4, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 0, y: 5})
        }),
        new Piece({
          name: 'king',
          color: 'black',
          position: new Position({x: 1, y: 5})
        }),
      ],
    });

    var useagePositions = Chess.getCardUsePositions(board, 'mind control', 'white');
    expect(compare(useagePositions, [
      Position.of({x:4, y:5}),
      Position.of({x:0, y:5}),
    ])).toBe(true);
  });
  it("Influence should add 1 plys to the current players plys next turn", function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['influence'], []],
      decks: [['pawn', 'pawn', 'pawn', 'pawn'],['pawn', 'pawn', 'pawn']],
      plysLeft: [1, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {}, game);

    expect(newGame.plysPerTurn).toEqual([3, 2]);

    var newGame = Chess.drawCardPly('black', newGame);
    var newGame = Chess.drawCardPly('black', newGame);

    expect(newGame.plysLeft).toEqual([3, 2]);
    expect(newGame.plysPerTurn).toEqual([3, 2]);

    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);

    expect(newGame.plysPerTurn).toEqual([2, 2]);
    expect(newGame.plysLeft).toEqual([2, 2]);
  });
  it("Influence should stack", function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['influence', 'influence'], []],
      decks: [['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],['pawn', 'pawn', 'pawn']],
      plysLeft: [2, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {}, game);
    var newGame = Chess.useCardPly('white', 0, {}, newGame);

    expect(newGame.plysPerTurn).toEqual([4, 2]);
    expect(newGame.plysLeft).toEqual([4, 2]);

    var newGame = Chess.drawCardPly('black', newGame);
    var newGame = Chess.drawCardPly('black', newGame);

    expect(newGame.plysPerTurn).toEqual([4, 2]);
    expect(newGame.plysLeft).toEqual([4, 2]);

    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);

    expect(newGame.plysPerTurn).toEqual([2, 2]);
    expect(newGame.plysLeft).toEqual([2, 2]);
  });
  it("Influence should not interfere with itself", function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['influence', 'influence'], []],
      decks: [['pawn', 'pawn', 'pawn', 'pawn'],['pawn', 'pawn']],
      plysLeft: [1, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {}, game);

    expect(newGame.plysLeft).toEqual([3, 2]);
    expect(newGame.plysPerTurn).toEqual([3, 2]);

    var newGame = Chess.drawCardPly('black', newGame);
    var newGame = Chess.drawCardPly('black', newGame);

    expect(newGame.plysPerTurn).toEqual([3, 2]);
    expect(newGame.plysLeft).toEqual([3, 2]);

    var newGame = Chess.useCardPly('white', 0, {}, newGame);
    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.drawCardPly('white', newGame);

    expect(newGame.plysLeft).toEqual([3, 2]);
    expect(newGame.plysPerTurn).toEqual([3, 2]);
  });
  it("Labor should add 2 actions", function() {
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['labor'], []],
      decks: [['pawn', 'pawn', 'pawn', 'pawn'],['pawn', 'pawn', 'pawn']],
      plysLeft: [2, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {}, game);

    expect(newGame.plysLeft).toEqual([3, 2]);

    newGame = compose(
      Chess.drawCardPly('white'),
      Chess.drawCardPly('white'),
      Chess.drawCardPly('white')
    )(newGame);

    expect(newGame.turn).toBe('black');
  });
  it("Coffer Upgrade should increase max gold by 5", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'king',
          color: 'white',
          asleep: false,
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'mine',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
        new Piece({
          name: 'mine',
          color: 'white',
          position: new Position({x: 2, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 1, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 0, y: 0})
        }),
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 5, y: 0})
        }),
      ],
    });

    var game = new Game({
      turn: 'white',
      board: board,
      resources: [10, 1],
      hands: [['coffer upgrade'], []],
      decks: [[],[]],
      plysLeft: 2,
    });

    var newGame = Chess.useCardPly('white', 0, {}, game);
    var actualGame = Chess.abilityPly(board.pieces[0], newGame);

    expect(actualGame.resources[0]).toBe(13);
  });
  it("Demolition should remove a building and give 3 gold", function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'mine',
          color: 'white',
          position: new Position({x: 4, y: 5})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [2, 1],
      hands: [['demolition'], []],
      decks: [['pawn'],['pawn', 'pawn', 'pawn']],
      plysLeft: [2, 2],
    });

    var newGame = Chess.useCardPly('white', 0, {
      positions: [Position.of({x: 4, y: 5})]
    }, game);

    expect(newGame.board.pieces.length).toBe(0);
    expect(newGame.resources[0]).toBe(4);
  });
  it("Bank should add one gold at the beginning of every turn", function() {
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
      turn: 'black',
      board: board,
      resources: [2, 1],
      hands: [['mine'], []],
      decks: [
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
        ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn']
      ],
      plysLeft: [2, 1],
    });

    var newGame = Chess.drawCardPly('black', game);

    expect(newGame.resources[0]).toEqual(3);

    newGame = Chess.drawCardPly('white', newGame);
    newGame = Chess.drawCardPly('white', newGame);

    expect(newGame.resources[0]).toEqual(3);

    newGame = Chess.drawCardPly('black', newGame);
    newGame = Chess.drawCardPly('black', newGame);

    expect(newGame.resources[0]).toEqual(4);

    newGame = Chess.useCardPly('white', 2, {
      positions: [Position.of({x: 4, y: 5})]
    }, newGame);
    newGame = Chess.drawCardPly('white', newGame);

    expect(newGame.resources[0]).toEqual(0);

    newGame = Chess.drawCardPly('black', newGame);
    newGame = Chess.drawCardPly('black', newGame);

    expect(newGame.resources[0]).toEqual(2);

  });
  it('Library ability should add one gold, draw one card.', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'library',
          color: 'white',
          asleep: false,
          position: new Position({x: 2, y: 0})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board,
      resources: [2, 2],
      hands: [[], []],
      decks: [['pawn'], []],
    });
    var actualGame = Chess.abilityPly(board.pieces[0], game);
    expect(actualGame.resources[0]).toBe(3);
    expect(actualGame.hands[0]).toEqual(['pawn']);
    expect(actualGame.decks[0]).toEqual([]);
  });
});
