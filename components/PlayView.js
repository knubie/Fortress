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
      selectedPiece: null,
      selectedCard: null,
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
  // TODO: move this to the engine.
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
        selectedPiece: piece,
        selectedCard: null,
      });
    }
  },
  clickCard: function(card, index) {
    console.log('click card ' + index);
    this.selectCard(index);
  },
  selectCard: function(card) {
    if (R.equals(this.state.selectedCard, card)) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null,
        selectedCard: null,
      });
    } else {
      this.setState({
        possibleMoves: Chess.getDraftSquares(this.state.game.board, this.playersHand()[card], this.state.playerColor),
        possibleCaptures: [],
        selectedPiece: null,
        selectedCard: card,
      });
    }
  },
  clickPiece: function(piece) {
    // TODO: move turn checking to the engine.
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
  clickSquare: function(x, y) {
    var position = Types.Position.of({ x: x, y: y });
    var selectedPiece = this.state.selectedPiece;
    var selectedCard = null;
    if (this.state.selectedCard != null) {
      selectedCard = Types.Piece.of({
        name: this.playersHand()[this.state.selectedCard],
        color: this.state.playerColor,
        // FIXME: this won't work for non-piece cards
        position: Types.Position.of({x: -1, y: -1}),
      });
    }
    // TODO: move turn checking to the engine.
    if (R.not(this.yourTurn()) ||
        (!selectedPiece && this.state.selectedCard == null) ||
        (selectedPiece != null && selectedPiece.color !== this.state.playerColor) ||
        // TODO: Move this into the engine.
        !R.contains(position, this.state.possibleMoves)) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null
      });
    } else if (selectedPiece) {
      this.makePly('move', selectedPiece.position, position);
    } else if (this.state.selectedCard) {
      // TODO: move this to the engine.
      if (this.state.game.resources[this.colorToIndex(this.state.playerColor)] < selectedCard.points) {
        alert('Not enough resources!');
      } else {
        // FIXME: change this API
        this.makePly('draft', null, position, null, this.state.selectedCard);
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
  makePly: function(plyType, startingPosition, targetPosition, piece, card) {
    var oldGame = this.state.game;
    this.setState({
      possibleMoves: [],
      possibleCaptures: [],
      game: Chess.makePly(plyType, this.state.game, {
        startingPosition,
        targetPosition,
        piece,
        card,
      }),
      selectedPiece: null,
      selectedCard: null,
    });
    AlertIOS.alert(
      'Confirm',
      'Are you sure you want to make this move?',
      [
        {text: 'Cancel', onPress: () => this.setState({game: oldGame}) },
        {text: 'OK', onPress: () => {
          // TODO: Get rid of this.
          //if (plyType === 'draft') {
            //this.drawCard();
          //}
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
  drawCard: function() {
    // TODO: Turn check and deck size should happen in-engine.
    if (R.not(this.yourTurn())) {
      alert('it\'s not your turn!');
    } else if (this.playersDeck().length < 1) {
      alert('You\'re out of cards');
    } else {
      // TODO: remove this shit
      AlertIOS.alert(
        'Confirm',
        'Are you sure you want to draw a card?',
        [
          {text: 'Cancel', onPress: () => {return;} },
          {text: 'OK', onPress: () => {
            this.setState({
              game: Chess.makePly('draw', this.state.game, {})
            });
            GameCenter.endTurnWithNextParticipants(this.state.game);
          }}
        ]
      );
    }
  },
  playersDeck: function() {
    return this.state.game.decks[this.colorToIndex(this.state.playerColor)];
  },
  playersHand: function() {
    return this.state.game.hands[this.colorToIndex(this.state.playerColor)];
  },
  render: function() {
    //var deck = R.map( name => {
      //return Types.Piece.of({
        //name: name,
        //color: this.state.playerColor,
        //position: Types.Position.of({x: -1, y: -1})
      //});
    //}, R.keys(Pieces));
    // TODO: change deck/hand api
    var cardInfo = this.state.selectedCard ?
      Types.Piece.of({
        name: this.playersHand()[this.state.selectedCard],
        color: 'white',
        position: Types.Position.of({x: -1, y: -1}),
      }) : null;

    var deck = R.filter((piece) => {
      return (piece.color === this.state.playerColor && piece.position.x === -1 && piece.position.y === -1);
    }, this.state.game.board.pieces);
    var hand = R.filter((piece) => {
      return (piece.color === this.state.playerColor && piece.position.x === -2 && piece.position.y === -2);
    }, this.state.game.board.pieces);
    return (
      <View>
        <View style={styles.titleContainer}>
          <Text onPress={this.back} style={styles.navigation}>
            ‹
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
            <TouchableHighlight style={styles.addCard} onPress={this.drawCard}>
              <Text style={styles.addCardText}>
                Draw a Card{'\n'}
                {this.state.game.decks[this.colorToIndex(this.state.playerColor)].length}/20
              </Text>
            </TouchableHighlight>
            {R.values(R.mapObjIndexed((card, i, deck) => {return (
              <PieceCard
                card={card}
                index={i}
                //piece={piece}
                //selected={R.equals(this.state.selectedPiece, piece)}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                selected={R.equals(this.state.selectedCard, i)}
                onPress={this.clickCard}/>
            )}, this.state.game.hands[this.colorToIndex(this.state.playerColor)]))}
          </ScrollView>
        </View>
        <PieceInfo
          piece={cardInfo || this.state.selectedPiece}
          isCard={!!cardInfo}
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
    marginHorizontal: 20,
    height: 30,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnMessage: {
    color: '#c4c4c4',
    fontWeight: '600',
    fontSize: 14,
  },
  navigation: {
    fontFamily: 'Anonymous Pro',
    fontSize: 45,
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
  addCard: {
    width: cardWidth,
    height: cardHeight,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: '#979797',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addCardText: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#979797',
  },
});
Math.random() * (max - min) + min
module.exports = PlayView;
