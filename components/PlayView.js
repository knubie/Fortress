var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var Chess = require('../engine/Main');
var Types = require('../engine/Types');
var PieceCard = require('./PieceCard.js');

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

var PlayView = React.createClass({
  getInitialState: function() {
    return {
      game: this.props.game,
      playerColor: this.props.game.turn === 'white' && this.props.yourTurn ||
                   this.props.game.turn === 'black' && !this.props.yourTurn ?
                                                                    'white' :
                                                                    'black',
      possibleMoves: [ ],
      selectedPiece: null
    }
  },
  yourTurn: function() {
    return this.state.game.turn === this.state.playerColor;
  },
  selectPiece: function(piece) {
    this.setState({
      possibleMoves: Chess.getMoves(this.state.game.board, piece),
      selectedPiece: piece
    });
  },
  clickPiece: function(piece) {
    if (R.not(this.yourTurn()) || this.state.selectedPiece == null) {
      this.selectPiece(piece);
    } else {
      if (piece.color === this.state.selectedPiece.color) {
        this.selectPiece(piece);
      } else {
        this.setState({
          possibleMoves: [],
          game: Chess.makePly(this.state.selectedPiece.position,
                              piece.position,
                              this.state.game),
          selectedPiece: null
        });
      }
    }
  },
  clickSquare: function(x, y) {
    var position = Types.Position.of({ x: x, y: y });
    var selectedPiece = this.state.selectedPiece;
    // TODO: Account for moving to other friendly piece.
    if (R.not(this.yourTurn())) {
      this.setState({
        possibleMoves: [],
        selectedPiece: null
      });
    } else if (selectedPiece) {
      this.setState({
        possibleMoves: [],
        game: Chess.makePly(selectedPiece.position,
                            position,
                            this.state.game),
        selectedPiece: null
      });
      // TODO: Get rid of this.
      if (!this.yourTurn()) {
        GameCenter.endTurnWithNextParticipants(this.state.game);
      }
    }
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Text>
          {this.yourTurn() ? 'Take your turn!' : 'Wait your turn!'}
        </Text>
        <Board
          board={this.state.game.board}
          possibleMoves={this.state.possibleMoves}
          playingFromWhitesPerspective={this.state.playerColor === 'white'}
          selectedPiece={this.state.selectedPiece}
          clickSquare={this.clickSquare}
          clickPiece={this.clickPiece}
        >
        </Board>
        <PieceCard piece={this.state.selectedPiece}></PieceCard>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    marginTop: 70,
  }
});

module.exports = PlayView;
