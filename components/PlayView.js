var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var Chess = require('../engine/Main');
var Types = require('../engine/Types');
var PieceInfo = require('./PieceInfo.js');

var GameCenter = require('../back-ends/game-center')

var {
  StyleSheet,
  AlertIOS,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  ProgressViewIOS,
  ScrollView,
  NativeAppEventEmitter,
} = React;

var oppositeColor = function(color) {
  return color === 'white' ? 'black' : 'white';
}

var subscription;

var PlayView = React.createClass({
  componentDidMount: function() {
    subscription = NativeAppEventEmitter.addListener(
      'updateMatchData',
      data => {
        if (!this.yourTurn()) {
          alert('it\'s your turn!');
        }
        this.setState({
          possibleMoves: [],
          possibleCaptures: [],
          selectedPiece: null,
          game: GameCenter.decode(data.match.matchData),
        });
      }
    );
  },
  updateMatch: function(game) {
  },
  componentWillUnmount: function() {
    subscription.remove();
  },
  getInitialState: function() {
    return {
      initGame: this.props.game,
      game: this.props.game,
      playerColor: this.props.game.turn === 'white' && this.props.yourTurn ||
                   this.props.game.turn === 'black' && !this.props.yourTurn ?
                                                                    'white' :
                                                                    'black',
      possibleMoves: [ ],
      possibleCaptures: [ ],
      selectedPiece: null
    }
  },
//getCurrentGame :: (Game) -> [Game]
  getCurrentGame: function(initialGame) {
    // TODO: ignore first two plys
    return R.reduce((game, ply) => {
      // FIXME: don't hardcode plyType argument
      return Chess.makePly('move', game, {
                             startingPosition: ply[0],
                             targetPosition: ply[1]});
    }, initialGame, initialGame.plys);
  },
  yourTurn: function() {
    return this.state.game.turn === this.state.playerColor;
  },
  selectPiece: function(piece) {
    if (R.equals(this.state.selectedPiece, piece)) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null,
      });
    } else {
      this.setState({
        possibleMoves: Chess.getMoves(this.state.game.board, piece),
        possibleCaptures: Chess.getCaptures(this.state.game.board, piece),
        selectedPiece: piece
      });
    }
  },
  clickPiece: function(piece) {
    if (R.not(this.yourTurn()) || this.state.selectedPiece == null) {
      this.selectPiece(piece);
    } else {
      if (R.contains(R.prop('position', piece), this.state.possibleMoves)) {
        this.makePly('move', this.state.selectedPiece.position, piece.position);
      } else {
        this.selectPiece(piece);
      }
    }
  },
  clickSquare: function(x, y) {
    var position = Types.Position.of({ x: x, y: y });
    var selectedPiece = this.state.selectedPiece;
    if (R.not(this.yourTurn())) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null
      });
    } else if (selectedPiece) {
      this.makePly('move', selectedPiece.position, position);
    }
  },
  onAbility: function(piece) {
    if (R.not(this.yourTurn())) {
      alert('Not your turn!');
    } else {
      this.makePly('ability', piece.position, null);
    }
  },
  makePly: function(plyType, startingPosition, targetPosition) {
    var oldGame = this.state.game;
    this.setState({
      possibleMoves: [],
      possibleCaptures: [],
      game: Chess.makePly(plyType, this.state.game, {
        startingPosition, targetPosition}),
      selectedPiece: null
    });
    AlertIOS.alert(
      'Confirm',
      'Are you sure you want to make this move?',
      [
        {text: 'Cancel', onPress: () => this.setState({game: oldGame}) },
        {text: 'OK', onPress: () => {
          // TODO: Get rid of this.
          if (!this.yourTurn()) {
            if (Chess.isGameOver(this.state.game.board, oppositeColor(this.state.playerColor))) {
              alert('You win!');
              GameCenter.endMatchInTurnWithMatchData(this.state.game);
            } else {
              GameCenter.endTurnWithNextParticipants(this.state.game);
            }
          }
        }}
      ]
    );

  },
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.turnMessage}>
          {this.yourTurn() ? 'Take your turn!' : 'Wait your turn!'}
        </Text>
        <Board
          board={this.state.game.board}
          possibleMoves={this.state.possibleMoves}
          possibleCaptures={this.state.possibleCaptures}
          playingFromWhitesPerspective={this.state.playerColor === 'white'}
          selectedPiece={this.state.selectedPiece}
          lastMove={R.head(R.reverse(this.state.game.plys))}
          clickSquare={this.clickSquare}
          clickPiece={this.clickPiece}
        ></Board>
        <PieceInfo
          style={styles.pieceInfo}
          piece={this.state.selectedPiece}
          onAbility={this.onAbility}
        ></PieceInfo>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    marginTop: 65,
    backgroundColor: '#212121',
    flex: 1,
  },
  pieceInfo: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'red',
  },
  turnMessage: {
    margin: 5,
    color: '#c4c4c4',
    fontWeight: 'bold',
    fontSize: 16,
  }
});

module.exports = PlayView;
