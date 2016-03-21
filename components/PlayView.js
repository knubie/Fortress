var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var Modal = require('./Modal');
var History = require('./History');
var Chess = require('../engine/Main');
var Types = require('../engine/Types');
var Pieces = require('../engine/Pieces');
var PieceInfo = require('./PieceInfo.js');
var PieceCard = require('./PieceCard.js');
var TitleBar = require('./TitleBar.js');
var CardIcon = require('./icons/Card');
var PieceDisplay = require('../lib/piece-display');
var Colors = require('../lib/colors');

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
  ScrollView,
  NativeAppEventEmitter,
  Image,
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
        // Load up-to-date Game data into state.
        // TODO: merge this into the 'loadNextGameState' setState method.
        this.setState({
          // Get new baseGame if the next ply is a draft.
          baseGame: this.state.game.plys.length < 2 ?
            GameCenter.getBaseGame(data.match.matchData) :
            this.state.baseGame,
          latestGame: GameCenter.instantiateObjects(JSON.parse(data.match.matchData))
        });

        // Load next game state if applicable
        if (!this.state.game.message) {
          this.loadNextGameState();
        }
      }
    );
  },
  loadNextGameState: function() {
    // If latest game is newer than current game, load it.
    if (this.state.game.plys.length < R.path(['latestGame', 'plys', 'length'], this.state)) {
      var nextGameState = this.state.game.plys.length < 2 ?
        this.state.latestGame :
        GameCenter.makePly(
          this.state.game,
          this.state.latestGame.plys[this.state.game.plys.length]
        );
      var yourTurnMessage = "";
      var theirName = this.props.theirName ? this.props.theirName.split(' ')[0] : 'Your Opponent';

      // Determine Game message.
      switch(R.last(nextGameState.plys).type) {
        case 'DrawPly':
          this.setState({
            cardPlayed: null
          });
          yourTurnMessage = (
            <View style={{flexWrap: 'wrap', flexDirection: 'row',}}>
              <Text style={{fontSize: 12, color: '#D8D8D8',}}>
                <Text style={{fontWeight: 'bold',}}>{theirName}</Text> drew </Text><CardIcon number={'1'}/><Text style={{fontSize: 12, color: '#D8D8D8',}}> card!
              </Text>
            </View>
          );
          break;

        case 'AbilityPly':
          var piece = R.last(nextGameState.plys).piece;
          var abilityName = PieceDisplay[piece.name]['ability'];
          this.setState({
            cardPlayed: null
          });
          yourTurnMessage = (
            <Text style={{fontSize: 12, color: '#D8D8D8',}}>
              It's your turn! <Text style={{fontWeight: 'bold'}}>{theirName}</Text> used the ability <Text style={{fontWeight: 'bold'}}>{abilityName}</Text>.
            </Text>
          );
          break;

        case 'UseCardPly':
          var card = R.last(nextGameState.plys).card;
          var cardName = this.state.game.hands[this.colorToIndex(this.state.game.turn)][card];
          // TODO fix this
          this.setState({
            cardPlayed: cardName
          });
          yourTurnMessage = (
            <Text style={{fontSize: 12, color: '#D8D8D8',}}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> played a card!
            </Text>);
          break;

        case 'MovePly':
          this.setState({
            cardPlayed: null
          });
          yourTurnMessage = (
            <Text style={{fontSize: 12, color: '#D8D8D8',}}>
              It's your turn! <Text style={{fontWeight: 'bold'}}>{theirName}</Text> moved a piece.
            </Text>
          );
          break;

        default:
          this.setState({
            cardPlayed: null
          });
          yourTurnMessage = (
            <Text style={{fontSize: 12, color: '#D8D8D8',}}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> joined the game!
            </Text>
          );
          break;

      }

      // Set the Game message.
      var game = Types.Game.of(
        R.assoc(
          'message',
          yourTurnMessage,
          nextGameState
        )
      );
      // Set the Game state.
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null,
        game: game,
      });
    }
  },
  clearMessage: function() {
    // Clear Game message
    this.setState({
      game: Types.Game.of(R.assoc('message', null, this.state.game)),
      cardPlayed: null,
    });
    this.loadNextGameState();
  },
  back: function() {
    this.props.navigator.pop();
  },
  history: function() {
    this.props.navigator.push({
      component: History,
      title: 'History',
      passProps: ({
        baseGame: this.state.baseGame,
        plys: this.state.game.plys,
        currentPlayer: this.state.playerColor,
      }),
    });
  },
  updateMatch: function(game) {
  },
  componentWillUnmount: function() {
    subscription.remove();
  },
  getInitialState: function() {
    return {
      baseGame: this.props.baseGame,
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
    //return R.reduce((game, ply) => {
      //// FIXME: don't hardcode plyType argument
      //return Chess.makePly('move', game, {
                             //startingPosition: ply[0],
                             //targetPosition: ply[1]});
    //}, initialGame, initialGame.plys);
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
        // account for other card types
        possibleMoves: Chess.getCardUsePositions(this.state.game.board, this.playersHand()[card], this.state.playerColor) || [],
        //possibleMoves: Chess.getDraftSquares(this.state.game.board, this.playersHand()[card], this.state.playerColor),
        possibleCaptures: [],
        selectedPiece: null,
        selectedCard: card,
      });
    }
  },
  clickPiece: function(piece) {
    // TODO: move turn checking to the engine.
    if (R.not(this.yourTurn()) ||
        (this.state.selectedPiece == null && this.state.selectedCard == null) ||
        (this.state.selectedPiece !== null && this.state.selectedPiece.color !== this.state.playerColor) ||
        !R.contains(R.prop('position', piece), this.state.possibleMoves)
    ) {
      this.selectPiece(piece);
    } else if (this.state.selectedPiece != null) {
      this.makePly(Chess.movePly(this.state.selectedPiece, piece.position, this.state.game));
    } else if (this.state.selectedCard != null) {
      this.makePly(Chess.useCardPly(this.state.playerColor, this.state.selectedCard, {
        positions: [piece.position],
      }, this.state.game));
    }
  },
  clickSquare: function(x, y) {
    var position = Types.Position.of({ x: x, y: y });
    var selectedPiece = this.state.selectedPiece;
    var selectedCard = this.state.selectedCard;
    if ((selectedPiece == null && selectedCard == null) ||
        (selectedPiece != null && selectedPiece.color !== this.state.playerColor) ||
        !R.contains(position, this.state.possibleMoves)) {
      this.setState({
        possibleMoves: [],
        possibleCaptures: [],
        selectedPiece: null,
        selectedCard: null
      });
    } else if (selectedPiece != null) {
      this.makePly(Chess.movePly(this.state.selectedPiece, position, this.state.game));
    } else if (selectedCard != null) {
      this.makePly(Chess.useCardPly(this.state.playerColor, selectedCard, {
        positions: [position],
      }, this.state.game));
    }
  },
  onAbility: function(piece) {
    this.makePly(Chess.abilityPly(piece, this.state.game));
  },
  useCard: function() {
    //var newGame = Chess.drawCardPly(this.state.playerColor, this.state.game);
    var newGame = Chess.useCardPly(this.state.playerColor, this.state.selectedCard, { }, this.state.game);
    if (newGame.message) {
      this.setState({game: newGame});
    } else {
        // TODO: Abstract this into modal?
      AlertIOS.alert(
        'Confirm',
        'Are you sure you want to use this card?',
        [
          {text: 'No Wait...', onPress: () => {return;} },
          {text: 'Yep!', onPress: () => {
            this.setState({ game: newGame });
            if (R.not(this.yourTurn())) {
              //GameCenter.endTurnWithNextParticipants(this.state.game);
              GameCenter.endTurnWithPlys(this.state.baseGame, this.state.game.plys);
            }
          }}
        ]
      );
    }
    //this.makePly(Chess.useCardPly(this.state.playerColor, this.state.selectedCard, { }, this.state.game));
    //this.makePly(Chess.abilityPly(piece, this.state.game));
  },
  makePly: function(newGame) {
    var oldGame = this.state.game;
    this.setState({
      possibleMoves: [],
      possibleCaptures: [],
      game: newGame,
      selectedPiece: null,
      selectedCard: null,
    });
    if (!this.state.game.message) {
      AlertIOS.alert(
        'Confirm',
        'Are you sure you want to make this move?',
        [
          {text: 'Cancel', onPress: () => this.setState({game: oldGame}) },
          {text: 'OK', onPress: () => {
            if (!this.yourTurn()) {
              if (Chess.isGameOver(this.state.game.board, oppositeColor(this.state.playerColor))) {
                alert('You win!');
                GameCenter.endMatchInTurnWithMatchData(this.state.baseGame, this.state.plys);
              } else {
                //GameCenter.endTurnWithNextParticipants(this.state.game);
                GameCenter.endTurnWithPlys(this.state.baseGame, this.state.game.plys);
              }
            }
          }}
        ]
      );
    }

  },
  drawCard: function() {
    var newGame = Chess.drawCardPly(this.state.playerColor, this.state.game);
    if (newGame.message) {
      this.setState({game: newGame});
    } else {
        // TODO: Abstract this into modal?
      AlertIOS.alert(
        'Confirm',
        'Are you sure you want to draw a card?',
        [
          {text: 'Cancel', onPress: () => {return;} },
          {text: 'OK', onPress: () => {
            this.setState({ game: newGame });
            if (R.not(this.yourTurn())) {
              //GameCenter.endTurnWithNextParticipants(this.state.game);
              GameCenter.endTurnWithPlys(this.state.baseGame, this.state.game.plys);
            }
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
  dummy: function() {
    alert('foo');
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

    var message = null;

    if (this.state.game.message) {
      message = (<Modal
        onPress={this.clearMessage}
        card={this.state.cardPlayed}
        message={typeof this.state.game.message === "string" ? (<Text style={{color: Colors.foreground}}>{this.state.game.message}</Text>) : this.state.game.message}
      >
      </Modal>);
    }
      //message = (<Modal
        //onPress={this.clearMessage}
        //card={'fortify'}
        //message={(<Text style={{color: Colors.foreground}}>test message</Text>)}
      //>
      //</Modal>);

    return (
      <View>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.history}
          leftText={'‹'}
          centerText={this.yourTurn() ? 'Your Turn' : 'Their Turn'}
          rightText={'Log'}
        />
        <Board
          board={this.state.game.board}
          possibleMoves={this.state.possibleMoves}
          possibleCaptures={this.state.possibleCaptures}
          playingFromWhitesPerspective={this.state.playerColor === 'white'}
          selectedPiece={this.state.selectedPiece}
          lastPly={R.head(R.reverse(this.state.game.plys))}
          clickSquare={this.clickSquare}
          clickPiece={this.clickPiece}
        ></Board>
        <View style={{marginTop: 7, marginHorizontal: 20, justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',}}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',}}>
            <Text style={{fontFamily: 'Source Code Pro', marginRight: 10, fontWeight: 'bold', fontSize: 10, color: '#DAB900',}}>
              <Text style={{fontWeight: '400'}}>GOLD</Text> {this.state.game.resources[this.colorToIndex(this.state.playerColor)]}
            </Text>
              {R.map((i) => {
                if (this.state.game.resources[this.colorToIndex(this.state.playerColor)] >= i) {
                  return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#DAB900'}}/>);
                } else {
                  return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#353535'}}/>);
                }
              }, R.range(1, this.state.game.maxResources[this.colorToIndex(this.state.playerColor)] + 1))}
          </View>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',}}>
            <Text style={{fontFamily: 'Source Code Pro', marginRight: 10, fontWeight: 'bold', fontSize: 10, color: '#C4C4C4',}}>
              <Text style={{fontWeight: '400'}}>ACTIONS</Text> {this.state.game.plysLeft[this.colorToIndex(this.state.game.turn)]}
            </Text>
              {R.map((i) => {
                if (this.state.game.plysLeft[this.colorToIndex(this.state.game.turn)] >= i) {
                  return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#C4C4C4'}}/>);
                } else {
                  return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#353535'}}/>);
                }
              }, [1,2])}
            </View>
        </View>
        <View style={styles.scrollViewContainer}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            <View style={styles.addCardBottom}/>
            <TouchableHighlight style={styles.addCard} onPress={this.drawCard}>
              <View style={styles.addCardInner}>
                <Image style={styles.cardBack} source={require('../assets/card-back-1.png')}/>
                <Text style={styles.addCardText}>
                  {this.state.game.decks[this.colorToIndex(this.state.playerColor)].length}
                </Text>
              </View>
            </TouchableHighlight>
            <View style={{
              width: (cardWidth + 10) * this.state.game.hands[this.colorToIndex(this.state.playerColor)].length
            }}/>
            {R.values(R.mapObjIndexed((card, i, deck) => {
              var index = parseInt(i);
              return (
              <PieceCard
                card={card}
                index={index}
                left={(cardWidth + 10) + ((cardWidth + 10) * parseInt(i))}
                //piece={piece}
                //selected={R.equals(this.state.selectedPiece, piece)}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                selected={R.equals(this.state.selectedCard, index)}
                onPress={this.clickCard}/>
            )}, this.state.game.hands[this.colorToIndex(this.state.playerColor)]))}
          </ScrollView>
        </View>
        <View style={{marginLeft: 10, width: Dimensions.get('window').width - 20,}}>
          <PieceInfo
            card={this.state.selectedPiece || this.playersHand()[this.state.selectedCard]}
            onAbility={this.onAbility}
            abilityButton={true}
            useCard={this.useCard}
          ></PieceInfo>
        </View>
        {message}
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
    height: 40,
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
    marginTop: 7,
    marginBottom: 20 - 8,
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addCard: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#D8D8D8',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowOpacity: 0.5,
    shadowRadius: 1,
    shadowOffset: {
      width: 1,
      height: 0,
    },
  },
  addCardBottom: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#D8D8D8',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 2,
    shadowOpacity: 0.5,
    shadowRadius: 0,
    shadowOffset: {
      width: 3,
      height: 3,
    },
  },
  addCardInner: {
    width: cardWidth - 6,
    height: cardHeight - 6,
    backgroundColor: '#A6A6A6',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addCardText: {
    textAlign: 'center',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    fontWeight: 'bold',
    color: '#8C8C8C',
    backgroundColor: '#D8D8D8',
  },
  cardBack: {
    width: Math.floor(56 * (Dimensions.get('window').width / 320)),
    height: 101,
    position: 'absolute',
    top: -6, left: -8,
  },
});

module.exports = PlayView;
