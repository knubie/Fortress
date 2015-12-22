var R = require('ramda');
var React = require('react-native');
//var Board = require('./Board');
//var Piece = require('./Piece');
//var Square = require('./Square');
var Chess = require('../engine/Main');
var Pieces = require('../engine/Pieces');
var Types = require('../engine/Types');

var { View, Text, } = React;

var COLOR = 'white'

var boardSize = 8;

var Builder = React.createClass({
  getInitialState: function() {
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      allPieces: R.map(function(name) {
        return Types.Piece.of({
          name: name,
          color: COLOR,
          position: Types.Position.of({x: -1, y: -1})
        });
      }, R.keys(Pieces))
    }
  },
  onDrop: function(x, y, piece) {
    this.setState({
      pieces: Chess.addPiece(
        // If moving a piece already on the board, remove it.
        reject(propEq('position', piece.position), this.state.pieces),
        Types.Piece.of({
          name: piece.name,
          color: piece.color,
          position: Types.Position.of({x: x, y: y})
        })
      )
    });
  },
  next: function() {
    var board = Types.Board.of({
      size: 8,
      pieces: [
        Types.Piece.of({
          name: 'rook',
          color: 'black',
          position: Types.Position.of({x: 0, y: 7})
        }),
        Types.Piece.of({
          name: 'knight',
          color: 'black',
          position: Types.Position.of({x: 1, y: 7})
        }),
        Types.Piece.of({
          name: 'bishop',
          color: 'black',
          position: Types.Position.of({x: 2, y: 7})
        }),
        Types.Piece.of({
          name: 'queen',
          color: 'black',
          position: Types.Position.of({x: 3, y: 7})
        }),
        Types.Piece.of({
          name: 'king',
          color: 'black',
          position: Types.Position.of({x: 4, y: 7})
        }),
        Types.Piece.of({
          name: 'bishop',
          color: 'black',
          position: Types.Position.of({x: 5, y: 7})
        }),
        Types.Piece.of({
          name: 'knight',
          color: 'black',
          position: Types.Position.of({x: 6, y: 7})
        }),
        Types.Piece.of({
          name: 'rook',
          color: 'black',
          position: Types.Position.of({x: 7, y: 7})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 0, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 1, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 2, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 3, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 4, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 5, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 6, y: 6})
        }),
        Types.Piece.of({
          name: 'pawn',
          color: 'black',
          position: Types.Position.of({x: 7, y: 6})
        }),
      ],
    });
    var game = Types.Game.of({
      turn: 'white',
      board: Types.Board.of(R.evolve({
        pieces: R.concat(this.state.pieces)
      }, board))
    });
    // if isYourTurn
    //   get new match data
    //   update match data with your army
    //   proceed to board screen
    // else notYourTurn
    //   store match data
    //   add waitingForOppennent message
    //
    //ReactDOM.render(
      //<Board game={game} board={board} />,
      //document.getElementById('container')
    //);
  },
  render: function() {
    //var _this = this;
    //var returnPiece = function(piece) {
      //return piece == null ?
                      //null :
                      //<Piece piece={piece}></Piece>;
    //}
    return (
      <View>
        <Text>This is the builder screen</Text>
      </View>
      //<div>
        //<div className='piece-selection'>
          //{R.map(function(piece) {
            //return (<Piece piece={piece}></Piece>)
          //}, this.state.allPieces)}
        //</div>
        //<div className='chess-board size-8 builder'>
          //{R.flatten(R.map(function(y) {
            //var y = 1 - y;
            //return R.map(function(x) {
              //var color = (x + y) % 2 === 1 ? 'black' : 'white'
              //return (
                //<Square color={color}
                        //onDrop={_this.onDrop}
                        //x={x} y={y}>
                  //{returnPiece(R.find(function(piece) {
                    //return (x === piece.position.x && y === piece.position.y);
                  //}, _this.state.pieces))}
                //</Square>
              //);
            //}, R.range(0, boardSize));
          //}, R.range(0, 2)))}
        //</div>
        //<div className='point-allotment'>
          //{R.reduce(function(acc, piece) {
            //return acc + Pieces[piece.name].points;
          //}, 0, this.state.pieces)}
          ///43
        //</div>
        //<div onClick={this.next}>next</div>
      //</div>
    );
  }
});

module.exports = Builder;
