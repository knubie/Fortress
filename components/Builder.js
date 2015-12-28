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
        rightButtonTitle: '',
      passProps: ({ game, yourTurn: false }),
    });
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
          progressViewStyle='bar'
          progress={
            R.reduce(function(acc, piece) {
              return acc + piece.points;
            }, 0, this.state.pieces) / 43
          }
        />
        <Text>
          Point allotment: {R.reduce(function(acc, piece) {
            return acc + piece.points;
          }, 0, this.state.pieces)}
          /43
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 170,
  },
  boardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    borderColor: '#eee',
    borderStyle: 'solid',
    borderWidth: 1,
    marginTop: 10,
    padding: 20,
    width: 100
  }
});

module.exports = Builder;
