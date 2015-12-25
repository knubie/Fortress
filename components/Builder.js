var R = require('ramda');
var React = require('react-native');
//var Board = require('./Board');
var Piece = require('./Piece');
var Square = require('./Square');
var Chess = require('../engine/Main');
var Pieces = require('../engine/Pieces');
var Types = require('../engine/Types');

var GameCenterManager = React.NativeModules.GameCenterManager;
var GameCenter = require('../back-ends/game-center')

var {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  ProgressViewIOS,
  ScrollView,
} = React;

var boardSize = 8;

var Builder = React.createClass({
  getInitialState: function() {
    var _this = this;
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      selectedPiece: null,
      allPieces: R.map(function(name) {
        return Types.Piece.of({
          name: name,
          color: _this.props.game.turn,
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
    var oppositeColor = function(color) {
      return color === 'white' ? 'black' : 'white';
    }
    var game = Types.Game.of(R.evolve({
      turn: oppositeColor,
      plys: R.append('draft'),
      board: R.compose(Types.Board.of, R.evolve({
        pieces: R.concat(this.state.pieces)
      }))
    }, this.props.game));
    GameCenter.endTurnWithNextParticipants(game);
  },
  clickSquare: function(x, y) {
    var piece = this.state.selectedPiece;
    console.log('click square');
    if (this.state.selectedPiece) {
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
    }
  },
  clickPiece: function(piece) {
    console.log('click piece');
    this.setState({
      selectedPiece: piece
    });
  },
  render: function() {
    var _this = this;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var returnPiece = function(piece) {
      return piece == null ?
                      null :
                      <Piece piece={piece} onClick={_this.clickPiece}></Piece>;
    }
    return (
      <View>
        <Text>This is the builder screen</Text>
        <ScrollView horizontal={true} contentContainerStyle={styles.container}>
          {R.map(function(piece) {
            return (<Piece
                      piece={piece}
                      onClick={_this.clickPiece}
                    ></Piece>)
          }, this.state.allPieces)}
        </ScrollView>
        <View style={styles.boardContainer}>
          {R.flatten(R.map(function(y) {
            if (_this.props.game.color === 'white') {
              var y = 1 - y;
            } else {
              var y = (boardSize - 2) + y;
            }
            return R.map(function(x) {
              if (_this.props.game.color === 'black') {
                var x = (board.size - 1) - x;
              }
              var color = (x + y) % 2 === 1 ? 'black' : 'white'
              return (
                <Square color={color}
                        onDrop={_this.onDrop}
                        onClick={_this.clickSquare}
                        x={x} y={y}>
                  {returnPiece(R.find(function(piece) {
                    return (x === piece.position.x && y === piece.position.y);
                  }, _this.state.pieces))}
                </Square>
              );
            }, R.range(0, boardSize));
          }, R.range(0, 2)))}
        </View>
        <ProgressViewIOS progress={
          R.reduce(function(acc, piece) {
            return acc + Pieces[piece.name].points;
          }, 0, this.state.pieces) / 43
        }/>
        <Text>
          Point allotment: {R.reduce(function(acc, piece) {
            return acc + Pieces[piece.name].points;
          }, 0, this.state.pieces)}
          /43
        </Text>
        <TouchableElement onPress={this.next}>
          <Text>Next</Text>
        </TouchableElement>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  boardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = Builder;
