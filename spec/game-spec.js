var R        = require('ramda');
var Game     = require('../engine/Types').Game;
var Board    = require('../engine/Types').Board;
var Piece    = require('../engine/Types').Piece;
var Position = require('../engine/Types').Position;
var Types = require('../engine/Types');
var Chess    = require('../engine/Main.js')
for (k in R) { global[k] = R[k]; }

var board = new Board({
  size: 8,
  pieces: [
    new Piece({
      name: 'rook',
      color: 'white',
      asleep: false,
      position: new Position({x: 4, y: 4})
    })
  ],
});

var game = new Game({
  turn: 'white',
  board: board
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

describe('Game', function() {
  it('Should be able to create a new game', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    });
  });
  it('Adding a piece in a position that\'s already occupied should replace that piece', () => {
    var pieces = [
      Piece.of({
        name: 'rook',
        color: 'white',
        asleep: false,
        position: new Position({x: 4, y: 4})
      }),
      Piece.of({
        name: 'rook',
        color: 'white',
        asleep: false,
        position: new Position({x: 3, y: 4})
      }),
      Piece.of({
        name: 'rook',
        color: 'white',
        asleep: false,
        position: new Position({x: 4, y: 5})
      }),
    ]
    var actualPieces = Chess.addPiece(
      pieces,
      Piece.of({
        name: 'bishop',
        color: 'white',
        asleep: false,
        position: new Position({x: 3, y: 4})
      })
    )
    var expectedPieces = [
      Piece.of({
        name: 'rook',
        color: 'white',
        asleep: false,
        position: new Position({x: 4, y: 4})
      }),
      Piece.of({
        name: 'bishop',
        color: 'white',
        asleep: false,
        position: new Position({x: 3, y: 4})
      }),
      Piece.of({
        name: 'rook',
        color: 'white',
        asleep: false,
        position: new Position({x: 4, y: 5})
      }),
    ]
  });
  it('Drawing a card from the deck into your hand should remove that card from the deck and add it to your hand', function() {
    var game = new Game({
      turn: 'white',
      board: board,
      plysLeft: [1, 2],
      decks: [['pawn', 'bishop', 'pawn'], []]
    });
    var actualGame = Chess.drawCardPly('white', game);
    expect(actualGame.turn).toBe("black");
    expect(actualGame.decks[0].length).toBe(2);
    expect(actualGame.hands[0].length).toBe(1);
    expect(actualGame.hands[0][0]).toBe('pawn');
  });
  it('Drawing a card from an empty deck should return return a message', function() {
    var game = new Game({
      turn: 'black',
      board: board,
      decks: [['pawn', 'bishop', 'pawn'], []]
    });
    var actualGame = Chess.drawCardPly('black', game);
    expect(actualGame.turn).toBe("black");
    expect(actualGame.plys.length).toBe(game.plys.length);
    expect(actualGame.message).toBe("Your deck is empty!");
  });
  it('Drawing a card when it\'s not your turn should return a message', function() {
    var game = new Game({
      turn: 'black',
      board: board,
      decks: [['pawn', 'bishop', 'pawn'], []]
    });
    var actualGame = Chess.drawCardPly('white', game);
    expect(actualGame.message).toBe("It's not your turn!");
    expect(actualGame.turn).toBe("black");
  });
  it('Drafting a piece should reduce that users resources by the point value of the piece', function() {
    var game = new Game({
      turn: 'white',
      hands: [ ['rook', 'bishop', 'pawn'], [] ],
      board: board
    });
    var actualGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 4, y: 0})]
    }, game);

    expect(actualGame.resources[0]).toBe(5);
  });
  it('Drafting a piece from the users hand should remove that card from their hand', function() {
    var game = new Game({
      turn: 'white',
      hands: [ ['pawn', 'bishop', 'pawn'], [] ],
      board: board
    });
    var actualGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 4, y: 2})]
    }, game);
    expect(equals(actualGame.hands[0], ['bishop', 'pawn'])).toBe(true);
  });
  it('Drafting a piece should add that piece to the Board\'s pieces array granted the user has enough resources to add the piece', function() {
    var game = new Game({
      turn: 'white',
      hands: [ ['pawn', 'bishop', 'pawn'], [] ],
      board: board
    });
    var actualGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 4, y: 2})]
    }, game);
    //var actualGame = Chess.draftPiece(Piece.of({
                       //name: 'rook',
                       //color: 'white',
                       //position: new Position({x: 4, y: 2})
                     //}), game);
    
    expect(actualGame.board.pieces.length).toBe(2);
  });
  it('Drafting a piece with a higher point value than the users resources should return null', function() {
    var actualGame = Chess.draftPiece(Piece.of({
                       name: 'rook',
                       color: 'white',
                       points: 100,
                       position: new Position({x: 4, y: 2})
                     }), game);
    
    expect(actualGame).toBe(null);
  });
  it('Should change turns when a players uses all their plys', function() {
    var game = Game.of({
      turn: 'white',
      hands: [['perception'], []],
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                game);
    var newGame = Chess.useCardPly('white', 0, {}, newGame);
    expect(equals(newGame.turn, 'black')).toBe(true);
  });
  it('Should not change turns when a user moves a piece to its original position', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 4}),
                                game);
    expect(equals(newGame.turn, 'white')).toBe(true);
  });
  it('Should only move a piece if it\'s that piece\'s turn', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'black',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                game);
    expect(newGame.message).toBe("It's not your turn!");
    expect(equals(game, dissoc('message', newGame))).toBe(true);
  });
  it('Should append a ply after a succesful turn', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game

    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                game);
    //var newGame = Chess.makePly('move', game, {
                                  //startingPosition: Position.of({x: 4, y: 4}),
                                  //targetPosition: Position.of({x: 4, y: 5})
                                //});
    expect(is(Types.MovePly, newGame.plys[0])).toBe(true);
    expect(equals(newGame.plys[0].piece, game.board.pieces[0])).toBe(true);
    expect(equals(newGame.plys[0].position, Position.of({x: 4, y: 5}))).toBe(true);
  });
  it('Should not be game over if there are royals left', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          }),
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 2, y: 3})
          }),
          Piece.of({
            name: 'king',
            color: 'black',
            asleep: false,
            position: Position.of({x: 4, y: 1})
          })
        ]
      })
    }); // game
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 2}),
                                game);
    expect(Chess.isGameOver(newGame.board, 'black')).toBe(false);
  });
  it('Should be game over if there are no royals left', function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'rook',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          }),
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 2, y: 3})
          }),
          Piece.of({
            name: 'king',
            color: 'black',
            asleep: false,
            position: Position.of({x: 4, y: 1})
          })
        ]
      })
    }); // game
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 1}),
                                game);
    expect(Chess.isGameOver(newGame.board, 'black')).toBe(true);
  });
  it("If a card's 'use' function provides a duplicate callback, it should work", function() {
    var game = new Game({
      turn: 'white',
      board: board,
      hands: [['king', 'queen', 'bishop', 'perception', 'shapeshifter'], []],
      decks: [['pawn', 'knight', 'rook', 'rook', 'queen', 'pawn', 'bishop', 'rook', 'king'], []],
    });
    var newGame = Chess.useCardPly('white', 3, { }, game);
    expect(equals(newGame.hands[0], ['rook', 'knight', 'pawn', 'king', 'queen', 'bishop', 'shapeshifter'])).toBe(true);
  });
  it("Player should not be able to use the same piece's ability twice in one turn", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game

    var newGame = Chess.abilityPly(game.board.pieces[0], game);
    var newGame2 = Chess.abilityPly(newGame.board.pieces[0], newGame);

    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("Player should not be able to move the same piece more than once a turn", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game

    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                game);
    var newGame2 = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 4, y: 4}),
                                newGame);

    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("Player should not be able to move a piece after using its ability in the same turn", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game

    var newGame = Chess.abilityPly(game.board.pieces[0], game);
    var newGame2 = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                newGame);

    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("Player should not be able to use a piece's ability after moving it in the same turn", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 4})
          })
        ]
      })
    }); // game

    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 5}),
                                game);
    var newGame2 = Chess.abilityPly(newGame.board.pieces[0], newGame);

    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("Player should not be able to use a piece immediately after summoning it.", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [],
      }),
      hands: [['rook'], []]
    }); // game

    var newGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 4, y: 0})]
    }, game);

    var newGame2 = Chess.movePly(newGame.board.pieces[0], 
                                Position.of({x: 4, y: 4}),
                                newGame);
    expect(newGame2.message).toBe("You must wait until the next turn to use this piece.");
    expect(equals(newGame, dissoc('message', newGame2))).toBe(true);
  });
  it("makePly should replicate a game exactly from base conditions.", function() {
    var game = Game.of({
      turn: 'white',
      board: Board.of({
        size: 8,
        pieces: [
          Piece.of({
            name: 'king',
            color: 'white',
            asleep: false,
            position: Position.of({x: 4, y: 0})
          }),
          Piece.of({
            name: 'king',
            color: 'black',
            asleep: false,
            position: Position.of({x: 4, y: 7})
          })
        ]
      }),
      resources: [5, 4],
      decks: [['bishop', 'pawn'], ['rook']],
      hands: [['pawn'], ['knight']],
    }); // game

    // White's turn
    var newGame = Chess.movePly(game.board.pieces[0], 
                                Position.of({x: 4, y: 1}),
                                game);
    var newGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 3, y: 0})]
    }, newGame);

    // Black's turn
    var newGame = Chess.abilityPly(game.board.pieces[1], newGame);
    var newGame = Chess.useCardPly('black', 0, {
      positions: [new Position({x: 3, y: 6})]
    }, newGame);

    // White's turn
    var newGame = Chess.drawCardPly('white', newGame);
    var newGame = Chess.useCardPly('white', 0, {
      positions: [new Position({x: 5, y: 0})]
    }, newGame);

    var expectedGame = Chess.getGameFromPlys(game, JSON.parse(JSON.stringify(newGame.plys)));

    expect(equals(newGame, expectedGame)).toBe(true);

  });
});
