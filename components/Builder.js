var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var PlayView = require('./PlayView');
var Piece = require('./Piece');
var Square = require('./Square');
var PieceCard = require('./PieceCard.js');
var Chess = require('../engine/Main');
var Pieces = require('../engine/Pieces');
var Types = require('../engine/Types');

var PieceDisplay = require('../lib/piece-display');

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
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      selectedPiece: null,
      game: this.props.game,
      allPieces: R.map( name => {
        return Types.Piece.of({
          name: name,
          color: this.props.game.turn,
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
    if (
      R.reduce(function(acc, piece) {
        return acc + piece.points;
      }, 0, this.state.pieces) > 45
    ) {
      alert('You\'ve not enough resources');
    } else if (R.filter(R.compose(contains('royal'), R.prop('types')), this.state.pieces).length < 1 ) {
      alert('You need at least one royal piece');
    } else {
      var game = Types.Game.of(R.evolve({
        turn: oppositeColor,
        plys: R.append('draft'),
        board: R.compose(Types.Board.of, R.evolve({
          pieces: R.concat(this.state.pieces)
        }))
      }, this.state.game));
      GameCenter.endTurnWithNextParticipants(game);
      // TODO: change this from push so user goes back to Home
      // May need to pop this index
      this.props.navigator.replace({
        component: PlayView,
        title: 'Play the game',
        passProps: ({ game, yourTurn: false }),
      });
    }
  },
  clickSquare: function(x, y) {
    var piece = this.state.selectedPiece;
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
        ),
        selectedPiece: null
      });
    }
  },
  clickPiece: function(piece) {
    // Pieces in the piece selection window have position:
    // x: -1, y: -1
    if (this.state.selectedPiece && piece.position.x >= 0) {
      this.clickSquare(piece.position.x, piece.position.y)
    } else {
      this.setState({
        selectedPiece: piece
      });
    }
  },
  render: function() {
    var _this = this;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var returnPiece = piece => {
      return piece == null ?
                      null :
                      <Piece piece={piece} onClick={this.clickPiece}></Piece>;
    }
    return (
      <View style={styles.outerContainer}>
        <View horizontal={true} style={styles.container}>
          {R.map(function(piece) {
            return (<Piece
                      piece={piece}
                      onClick={_this.clickPiece}
                    ></Piece>)
          }, this.state.allPieces)}
        </View>
        <View style={styles.boardContainer}>
          {R.flatten(R.map(function(y) {
            if (_this.state.game.turn === 'white') {
              var y = 1 - y;
            } else {
              var y = (boardSize - 2) + y;
            }
            return R.map(function(x) {
              if (_this.state.game.turn === 'black') {
                var x = (boardSize - 1) - x;
              }
              var color = (x + y) % 2 === 1 ? 'black' : 'white'
              return (
                <Square color={color}
                        onDrop={_this.onDrop}
                        onClick={_this.clickSquare}
                        x={x} y={y}>
                  {returnPiece(R.find(R.compose(
                    R.whereEq({x,y}),
                    R.prop('position')
                  ), _this.state.pieces))}
                </Square>
              );
            }, R.range(0, boardSize));
          }, R.range(0, 2)))}
        </View>
        <ProgressViewIOS
          style={styles.progress}
          progress={
            R.reduce(function(acc, piece) {
              return acc + piece.points;
            }, 0, this.state.pieces) / 45
          }
        />
        <Text>
          Point allotment: {R.reduce(function(acc, piece) {
            return acc + piece.points;
          }, 0, this.state.pieces)}
          /45
        </Text>
        <PieceCard piece={this.state.selectedPiece}></PieceCard>
        <TouchableElement onPress={this.next}>
          <Text>Next</Text>
        </TouchableElement>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  outerContainer: {
    paddingTop: 70
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  boardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    marginTop: 10,
    width: 100
  }
});

module.exports = Builder;
