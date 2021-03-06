var R        = require('ramda');
var Board    = require('../engine/Types').Board;
var Game     = require('../engine/Types').Game;
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

describe('Movement', function() {
  it('n(1/0) should return all possible moves', function() {
    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 0},
      {x: 4, y: 1},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6},
      {x: 4, y: 7},
      {y: 4, x: 0},
      {y: 4, x: 1},
      {y: 4, x: 2},
      {y: 4, x: 3},
      {y: 4, x: 5},
      {y: 4, x: 6},
      {y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);

    p = new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 0, y: 7})
    });
    actualMoves = Chess.getMoves(board, p);
    expectedMoves = [
      {x: 0, y: 0},
      {x: 0, y: 1},
      {x: 0, y: 2},
      {x: 0, y: 3},
      {x: 0, y: 4},
      {x: 0, y: 5},
      {x: 0, y: 6},
      {y: 7, x: 1},
      {y: 7, x: 2},
      {y: 7, x: 3},
      {y: 7, x: 4},
      {y: 7, x: 5},
      {y: 7, x: 6},
      {y: 7, x: 7}
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('2+ should return all possible moves', function() {
    var p = new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    p.parlett = [{movement: '1/0', distance: '2'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6},
      {y: 4, x: 2},
      {y: 4, x: 3},
      {y: 4, x: 5},
      {y: 4, x: 6}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('2> should return all possible moves', function() {
    var p = new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    p.parlett = [{movement: '1/0', direction: 'forwards', distance: '2'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 5},
      {x: 4, y: 6}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('3<= should return all possible moves', function() {
    var p = new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    p.parlett = [
      {movement: '1/0', direction: 'backwards', distance: '3'},
      {movement: '1/0', direction: 'sideways', distance: '3'},
    ]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 1},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {y: 4, x: 1},
      {y: 4, x: 2},
      {y: 4, x: 3},
      {y: 4, x: 5},
      {y: 4, x: 6},
      {y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('nX should return all possible moves', function() {
    var p = new Piece({
      name: 'bishop',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 5, y: 5},
      {x: 6, y: 6},
      {x: 7, y: 7},
      {x: 1, y: 7},
      {x: 2, y: 6},
      {x: 3, y: 5},
      {x: 5, y: 3},
      {x: 6, y: 2},
      {x: 7, y: 1}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('nX> should return all possible moves', function() {
    var p = new Piece({
      name: 'bishop',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    p.parlett = [{movement: '1/1', direction: 'forwards', distance: 'n'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 5, y: 5},
      {x: 6, y: 6},
      {x: 7, y: 7},
      {x: 1, y: 7},
      {x: 2, y: 6},
      {x: 3, y: 5}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('1X> should return all possible moves', function() {
    var p = new Piece({
      name: 'bishop',
      color: 'white',
      position: new Position({x: 3, y: 4})
    });
    p.parlett = [{movement: '1/1', direction: 'forwards', distance: '1'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 5},
      {x: 2, y: 5}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('nX< should return all possible moves', function() {
    var p = new Piece({
      name: 'bishop',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    p.parlett = [{movement: '1/1', direction: 'backwards', distance: 'n'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 5, y: 3},
      {x: 6, y: 2},
      {x: 7, y: 1}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('other pieces on the board should block nX', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'bishop',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 6, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 2, y: 2})
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      //{x: 0, y: 0},
      //{x: 1, y: 1},
      {x: 2, y: 2}, // Black Piece
      {x: 3, y: 3},
      {x: 5, y: 5},
      //{x: 6, y: 6}, // Blocked by white piece
      //{x: 7, y: 7},
      {x: 1, y: 7},
      {x: 2, y: 6},
      {x: 3, y: 5},
      {x: 5, y: 3},
      {x: 6, y: 2},
      {x: 7, y: 1}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('~1(1/2) should return all possible moves', function() {
    var p = new Piece({
      name: 'knight',
      color: 'white',
      position: new Position({x: 4, y: 4})
    });
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 3, y: 2},
      {x: 2, y: 3},
      {x: 2, y: 5},
      {x: 3, y: 6},
      {x: 5, y: 6},
      {x: 6, y: 5},
      {x: 6, y: 3},
      {x: 5, y: 2}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('~n(1/2) should return all possible moves', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 5, y: 3})
        })
      ],
    });
    var p = new Piece({
      name: 'rook',
      color: 'white',
      position: new Position({x: 1, y: 1})
    });
    p.parlett = [{movement: '1/2', distance: 'n'}]
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 3, y: 0},
      {x: 3, y: 2},
      {x: 0, y: 3},
      {x: 2, y: 3},
      {x: 3, y: 5},
      {x: 4, y: 7},
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('other pieces on the board should block n+', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 2, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 0, y: 4})
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 0}, // Black piece
      {x: 4, y: 1},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6}, // Black blocking
      //{x: 4, y: 7},

      //{y: 4, x: 0},
      //{y: 4, x: 1},
      //{y: 4, x: 2}, // White blocking
      {y: 4, x: 3},
      {y: 4, x: 5},
      {y: 4, x: 6},
      {y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('gun type pieces should be able to capture without moving', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'cannon',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 3, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 0, y: 4})
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 4, y: 3},
      {x: 5, y: 4},
      {x: 4, y: 5},
      //{x: 3, y: 4}, // White rook
      {x: 4, y: 6}    // Black rook
      //{x: 4, y: 0}  // Black rook
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);


    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualBoard = Chess.movePiece(Position.of({x: 4, y: 4}), Position.of({x: 4, y: 6}), game).board;
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'cannon',
          color: 'white',
          position: new Position({x: 4, y: 4}),
          moves: 1
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 3, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 0, y: 4})
        })
      ],
    });
    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });

  it('get captures should return a list of capturable positions for n+', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 2, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 7}) // doesn't get blocked
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getCaptures(board, p);
    var expectedMoves = [
      {x: 4, y: 0}, // Black piece
      //{x: 4, y: 1},
      //{x: 4, y: 2},
      //{x: 4, y: 3},
      //{x: 4, y: 5},
      {x: 4, y: 6}, // Black piece
      //{x: 4, y: 7}, // Black piece

      //{y: 4, x: 0},
      //{y: 4, x: 1},
      //{y: 4, x: 2}, // White blocking
      //{y: 4, x: 3},
      //{y: 4, x: 5},
      //{y: 4, x: 6},
      //{y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('get defends should return a list of pieces being defended', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 2, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 7}) // doesn't get blocked
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getDefends(board, p);
    var expectedMoves = [
      //{x: 4, y: 0}, // Black piece
      //{x: 4, y: 1},
      //{x: 4, y: 2},
      //{x: 4, y: 3},
      //{x: 4, y: 5},
      //{x: 4, y: 6}, // Black piece
      //{x: 4, y: 7}, // Black piece

      //{y: 4, x: 0},
      //{y: 4, x: 1},
      {y: 4, x: 2}, // White blocking
      //{y: 4, x: 3},
      //{y: 4, x: 5},
      //{y: 4, x: 6},
      //{y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('movePiece should return a new Board with the updated pieces', function() {
    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 0}),
          moves: 1
        })
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });

    var actualBoard = Chess.movePiece(new Position({x: 4, y: 4}), new Position({x: 4, y: 0}), game).board;

    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });

  it('movePiece should retain other pieces on the board', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 6, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 7, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
      ],
    });

    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 0}),
          moves: 1
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 6, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 7, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 3, y: 0})
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });

    var actualBoard = Chess.movePiece(new Position({x: 4, y: 4}), new Position({x: 4, y: 0}), game).board;

    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });

  it('movePiece should remove captured piece from the board', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 6, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 7, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'black',
          position: new Position({x: 4, y: 0})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 4})
        }),
      ],
    });

    var expectedBoard = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 6, y: 6})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 7, y: 5})
        }),
        new Piece({
          name: 'rook',
          color: 'white',
          position: new Position({x: 4, y: 0}),
          moves: 1
        }),
      ],
    });
    var game = new Game({
      turn: 'white',
      board: board
    });

    var actualBoard = Chess.movePiece(new Position({x: 4, y: 4}), new Position({x: 4, y: 0}), game).board;

    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });

  it('movePiece should return null when the move is invalid', function() {
    var expectedBoard = null; 
    var game = new Game({
      turn: 'white',
      board: board
    });
    var actualBoard = Chess.movePiece(new Position({x: 4, y: 4}), new Position({x: 6, y: 6}), game);
    expect(equals(expectedBoard, actualBoard)).toBe(true);
  });

  it('a piece with multiple parlett rules should return all possible moves', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'queen',
          color: 'white',
          position: new Position({x: 4, y: 4})
        })
      ],
    });
    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      // Diagonal
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 5, y: 5},
      {x: 6, y: 6},
      {x: 7, y: 7},
      {x: 1, y: 7},
      {x: 2, y: 6},
      {x: 3, y: 5},
      {x: 5, y: 3},
      {x: 6, y: 2},
      {x: 7, y: 1},
      // Orthogonal
      {x: 4, y: 0},
      {x: 4, y: 1},
      {x: 4, y: 2},
      {x: 4, y: 3},
      {x: 4, y: 5},
      {x: 4, y: 6},
      {x: 4, y: 7},
      {y: 4, x: 0},
      {y: 4, x: 1},
      {y: 4, x: 2},
      {y: 4, x: 3},
      {y: 4, x: 5},
      {y: 4, x: 6},
      {y: 4, x: 7}
    ];

    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('parlett\'s "initial condition" should be met', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 1})
        })
      ],
    });

    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 2, y: 2},
      {x: 2, y: 3}
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);

    var p2 = Piece.of({
      name: 'pawn',
      color: 'white',
      position: new Position({x: 2, y: 2}),
      moves: '1'
    });
    var actualMoves = Chess.getMoves(board, p2);
    var expectedMoves = [
      {x: 2, y: 3}
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('parlett\'s "capture condition" should be met', function() {
    var board = new Board({
      size: 8,
      pieces: [
        new Piece({
          name: 'pawn',
          color: 'white',
          position: new Position({x: 2, y: 1})
        }),
        new Piece({
          name: 'pawn',
          color: 'black',
          position: new Position({x: 1, y: 2})
        }),
      ],
    });

    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 2, y: 2},
      {x: 2, y: 3},
      {x: 1, y: 2}
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });

  it('parlett\'s "!capture condition" should be met', function() {
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
          color: 'black',
          position: new Position({x: 2, y: 2})
        }),
      ],
    });

    var p = board.pieces[0];
    var actualMoves = Chess.getMoves(board, p);
    var expectedMoves = [
      {x: 2, y: 1},
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);

    var p2 = Piece.of({
      name: 'pawn',
      color: 'white',
      position: new Position({x: 2, y: 1}),
      moves: '1'
    });
    var actualMoves = Chess.getMoves(board, p2);
    var expectedMoves = [ ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });
  //TODO write a test for black.
  it('getMoves of a card in hand should return the first or first and second rank.', function() {
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
          color: 'black',
          position: new Position({x: 2, y: 2})
        }),
      ],
    });
    var actualMoves = Chess.getCardUsePositions(board, 'queen', 'white');
    var expectedMoves = [
      {x: 0, y: 0},
      {x: 1, y: 0},
      //{x: 2, y: 0}, // White pawn
      {x: 3, y: 0},
      {x: 4, y: 0},
      {x: 5, y: 0},
      {x: 6, y: 0},
      {x: 7, y: 0},
    ];
    expect(compare(expectedMoves, actualMoves)).toBe(true);
  });
});
