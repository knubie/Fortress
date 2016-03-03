var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var Modal = require('./Modal');
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
        var decodedGame = GameCenter.decode(data.match.matchData);
        //TODO: just use this.state.game
        var previousGameState = R.reduce(GameCenter.makePly, GameCenter.instantiateObjects(JSON.parse(data.match.matchData)), R.init(decodedGame.plys));
        var yourTurnMessage = "It's your turn!";
        var theirName = this.props.theirName ? this.props.theirName.split(' ')[0] : 'Your Opponent';
        switch(R.last(decodedGame.plys).type) {

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
            //yourTurnMessage = (
              //<Text>
              //{"It's your turn! " + theirName + " drew a card."}
              //</Text>
            //);
            break;

          case 'AbilityPly':
            var piece = R.last(decodedGame.plys).piece;
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
            var card = R.last(decodedGame.plys).card;
            var cardName = previousGameState.hands[this.colorToIndex(previousGameState.turn)][card];
            // TODO fix this
            this.setState({
              cardPlayed: cardName
            });
            //yourTurnMessage = (
              //<PieceInfo
                //card={cardName}
                //onAbility={this.onAbility}
                //useCard={this.useCard}
              //></PieceInfo>
            //);
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
        }
        var game = Types.Game.of(
          R.assoc(
            'message',
            (!this.yourTurn() && data.match.yourTurn) ?
              yourTurnMessage : this.state.game.message,
            GameCenter.decode(data.match.matchData)
          )
        );
        this.setState({
          possibleMoves: [],
          possibleCaptures: [],
          selectedPiece: null,
          baseGame: GameCenter.getBaseGame(data.match.matchData),
          game: game,
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
  clearMessage: function() {
    this.setState({
      game: Types.Game.of(R.assoc('message', null, this.state.game))
    });
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
      if (this.state.cardPlayed != null) {
        message = (<Modal
          onPress={this.clearMessage}
          message={typeof this.state.game.message === "string" ? (<Text style={{color: Colors.foreground}}>{this.state.game.message}</Text>) : this.state.game.message}
        >
          <Image
            source={PieceDisplay[this.state.cardPlayed].image['black']}
            style={{marginBottom: 10, backgroundColor: 'rgba(0,0,0,0)', width: 42}}
          />
          <PieceInfo
            light={true}
            card={this.state.cardPlayed}
            onAbility={this.onAbility}
            useCard={this.useCard}
          ></PieceInfo>
        </Modal>);
      } else {
        message = (<Modal
          onPress={this.clearMessage}
          message={typeof this.state.game.message === "string" ? (<Text style={{color: Colors.foreground}}>{this.state.game.message}</Text>) : this.state.game.message}
        >
        </Modal>);
      }
    }
        //message = (<Modal
          //onPress={this.dummy}
          //message={(
            //<View style={{flexWrap: 'wrap', flexDirection: 'row',}}><Text style={{fontSize: 12, color: '#D8D8D8',}}><Text style={{fontWeight: 'bold',}}>Kim Nguyen</Text> drew </Text><Image style={{width: 14, height: 17,}} source={require('../assets/card-icon.png')}><Text style={{position: 'absolute', left: 7, top: 1, fontSize: 9, color: '#353535',}}>1</Text></Image><Text style={{fontSize: 12, color: '#D8D8D8',}}> card!</Text></View>
          //)}
        //>
        //</Modal>);

    return (
      <View>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={() => { return; }}
          leftText={'‹'}
          centerText={this.yourTurn() ? 'Your Turn' : 'Their Turn'}
          rightText={'Gold: ' + this.state.game.resources[this.colorToIndex(this.state.playerColor)]}
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
        <View style={{marginTop: 7, marginLeft: 20, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',}}>
          <Text style={{paddingHorizontal: 2, marginRight: 4, fontWeight: 'bold', fontSize: 10, color: '#DAB900',}}>
          GOLD: {this.state.game.resources[this.colorToIndex(this.state.playerColor)]}<Text style={{color: '#836F00'}}>/10</Text></Text>
          {R.map((i) => {
            if (this.state.game.resources[this.colorToIndex(this.state.playerColor)] >= i) {
              return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#DAB900'}}/>);
            } else {
              return (<View style={{marginRight: 2, width: 6, height: 6, borderRadius: 3, backgroundColor: '#353535'}}/>);
            }
          }, [1,2,3,4,5,6,7,8,9,10])}
          <Text style={{color: 'white'}}>PLYS: {this.state.game.plysLeft}</Text>
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
    width: 56,
    height: 101,
    position: 'absolute',
    top: -6, left: -8,
  },
});

module.exports = PlayView;
