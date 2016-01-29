var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var Chess = require('../engine/Main');
var Types = require('../engine/Types');
var Pieces = require('../engine/Pieces');
var PieceInfo = require('./PieceInfo.js');
var PieceCard = require('./PieceCard.js');

var GameCenter = require('../back-ends/game-center')

var {
  Dimensions,
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
        if (!this.yourTurn() && data.match.yourTurn) {
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
  back: function() {
    this.props.navigator.pop();
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
  colorToIndex: function(color) {
    return color === 'white' ? 0 : 1;
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
    if (R.not(this.yourTurn()) || this.state.selectedPiece == null || this.state.selectedPiece.color !== this.state.playerColor) {
      this.selectPiece(piece);
    } else {
      if (R.contains(R.prop('position', piece), this.state.possibleMoves)) {
        this.makePly('move', this.state.selectedPiece.position, piece.position);
      } else {
        this.selectPiece(piece);
      }
    }
  },
  clickCard: function(piece) {
    if (R.equals(this.state.selectedPiece, piece)) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null,
      });
    } else {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: piece,
      });
    }
  },
  clickSquare: function(x, y) {
    var position = Types.Position.of({ x: x, y: y });
    var selectedPiece = this.state.selectedPiece;
    if (R.not(this.yourTurn()) ||
        !this.state.selectedPiece ||
        this.state.selectedPiece.color !== this.state.playerColor) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null
      });
    } else if (selectedPiece) {
      // if selectedPiece is on the board
      // TODO: better way of determining this?
      if (selectedPiece.position.x > -1) {
        this.makePly('move', selectedPiece.position, position);
      } else {
        if (this.state.game.resources[this.colorToIndex(this.state.playerColor)] < selectedPiece.points) {
          alert('Not enough resources!');
        } else {
          this.makePly('draft', null, position, selectedPiece);
        }
      }
    }
  },
  onAbility: function(piece) {
    if (R.not(this.yourTurn())) {
      alert('Not your turn!');
    } else {
      this.makePly('ability', piece.position, null);
    }
  },
  //TODO: replace starting position with 'piece'
  makePly: function(plyType, startingPosition, targetPosition, piece) {
    var oldGame = this.state.game;
    this.setState({
      possibleMoves: [],
      possibleCaptures: [],
      game: Chess.makePly(plyType, this.state.game, {
        startingPosition,
        targetPosition,
        piece,
      }),
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
    var deck = R.map( name => {
      return Types.Piece.of({
        name: name,
        color: this.state.playerColor,
        position: Types.Position.of({x: -1, y: -1})
      });
    }, R.keys(Pieces));
    return (
      <View>
        <View style={styles.titleContainer}>
          <Text onPress={this.back} style={styles.navigation}>
            ⬅︎
          </Text>
          <Text style={styles.turnMessage}>
            {this.yourTurn() ? 'Your Turn' : 'Their Turn'}
          </Text>
          <Text style={styles.turnMessage}>
            Gold: {this.state.game.resources[this.colorToIndex(this.state.playerColor)]}
          </Text>
        </View>
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
        <View style={styles.scrollViewContainer}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            {R.map((piece) => {return (
              <PieceCard
                piece={piece}
                selected={R.equals(this.state.selectedPiece, piece)}
                disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                onPress={this.clickCard}/>
            )}, deck)}
          </ScrollView>
        </View>
        <PieceInfo
          piece={this.state.selectedPiece}
          onAbility={this.onAbility}
        ></PieceInfo>
      </View>
    );
  }
});


var cardMargin = (Dimensions.get('window').width - 300) / 2
var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;
var styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  turnMessage: {
    marginVertical: 5,
    marginHorizontal: 10,
    color: '#c4c4c4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navigation: {
    height: 20,
    padding: 5,
    fontSize: 25,
    color: '#c4c4c4',
    fontWeight: 'bold',
  },
  scrollViewContainer: {
    height: cardHeight + 8,
    margin: 20,
    marginBottom: 20 - 8,
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

module.exports = PlayView;
