var R = require('ramda');
var React = require('react-native');
var Board = require('./Board');
var PlayView = require('./PlayView');
var Piece = require('./Piece');
var Square = require('./Square');
var PieceInfo = require('./PieceInfo.js');
var PieceCard = require('./PieceCard.js');
var PieceDisplay = require('../lib/piece-display');
var Chess = require('../engine/Main');
var Pieces = require('../engine/Pieces');
var Types = require('../engine/Types');

var PieceDisplay = require('../lib/piece-display');

var GameCenter = require('../back-ends/game-center')

var {
  AlertIOS,
  AsyncStorage,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  ScrollView,
} = React;

var boardSize = 8;

var MAX_DECK_SIZE = 20;
var HAND_SIZE = 4;
var DeckBuilder = React.createClass({
  componentDidMount: function() {
    // TODO: move this to home to avoid async pop-in
    AsyncStorage.getItem('decks', (error, result) => {
      var decks = JSON.parse(result);
      this.setState({decks});
    });
  },
  getInitialState: function() {
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      selectedCardInDeck: null,
      selectedCardInCollection: null,
      game: this.props.game,
      selectedDeck: 'New Deck',
    }
  },
  next: function() {
    var oppositeColor = function(color) {
      return color === 'white' ? 'black' : 'white';
    }
    if (this.deck().length > MAX_DECK_SIZE) {
      alert('You have too many cards.');
    } else {
      // TODO move this into the engine.
      var colorIndex = this.state.game.turn === 'white' ? 0 : 1;
      //this.setState({
        //game: R.assoc(
                //'decks',
                //adjust(always(this.state.selectedDeck), colorIndex, this.state.game.decks),
                //this.state.game)
      //});
      var drawHand = function drawHand(game) {
        // HAND_SIZE + colorIndex -> give black an extra card.
        if (game.hands[colorIndex].length < HAND_SIZE + colorIndex) {
          return drawHand(Chess.drawCard(game.turn, game));
        } else {
          return game;
        }
      }
      var game = Types.Game.of(R.evolve({
        turn: oppositeColor,
        plys: R.append('draft'),
      }, drawHand(R.assoc(
        'decks',
        adjust(always(this.state.decks[this.state.selectedDeck]), colorIndex, this.state.game.decks),
        this.state.game)
      )));
      GameCenter.endTurnWithGame(game);
      //GameCenter.endTurnWithNextParticipants(game);
      this.props.navigator.replace({
        component: PlayView,
        title: 'Play the game',
        passProps: ({ game, baseGame: game, yourTurn: false }),
      });
    }
  },
  back: function() {
    this.props.navigator.pop();
  },
  removeFromDeck: function() {
    console.log('remove from deck');
    // FIXME: something breaks when removing the bank
    if (this.state.selectedCardInDeck) {
      this.setState({
        selectedCardInDeck: null,
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.remove(
                    this.state.selectedCardInDeck, 1,
                    this.state.decks[this.state.selectedDeck]
                  ),
                  //R.append(this.state.selectedPiece.name, this.state.decks[this.state.selectedDeck]),
                  this.state.decks
                )
      });
    }
  },
  addToDeck: function() {
    if (this.state.selectedCardInCollection) {
      this.setState({
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.append(R.keys(Pieces)[this.state.selectedCardInCollection], this.state.decks[this.state.selectedDeck]),
                  this.state.decks
                )
      });
    }
  },
  clickCardInCollection: function(card, index) {
    this.setState({
      selectedCardInDeck: null,
      selectedCardInCollection: index,
    });
  },
  clickCardInDeck: function(card, index) {
    this.setState({
      selectedCardInDeck: index,
      selectedCardInCollection: null,
    });
  },
  deck: function() {
    // TODO if deck init is moved to Home, might not need this.
    if (this.state.decks && this.state.decks[this.state.selectedDeck]) {
      return this.state.decks[this.state.selectedDeck];
    } else {
      return [];
    }
  },
  selectDeck: function(deck) {
    this.setState({
      selectedDeck: deck,
    });
  },
  saveDeck: function() {
    // TODO: prevent saving as 'New Deck'
    AlertIOS.prompt('Save Deck', 'What do you want to call this deck?', (name) => {
      name = name || 'Untitled Deck';
      this.setState({
        decks: R.assoc('New Deck', [], R.assoc(name, this.state.decks[this.state.selectedDeck], this.state.decks)),
        selectedDeck: name
      });
      AsyncStorage.setItem('decks', JSON.stringify(this.state.decks), function(error) {
        console.log(error);
      });
    });
  },
  deleteDeck: function() {
    AlertIOS.alert(
      'Delete Deck',
      'Are you sure you want to delete this deck?',
      [
        {text: 'Nevermind!', onPress: () => { return null }},
        {text: 'Yep', onPress: () => {
          this.setState({
            decks: R.dissoc(this.state.selectedDeck, this.state.decks),
            selectedDeck: 'New Deck',
          });
          AsyncStorage.setItem('decks', JSON.stringify(this.state.decks), function(error) {
            console.log(error);
          });
        }}
      ]
    );

  },
  render: function() {
    var _this = this;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }

    var decks = R.map(deck => {
      var deckClass = deck === this.state.selectedDeck ? styles.deckSelected : null;
      return (
        <Text onPress={this.selectDeck.bind(this, deck)} style={[styles.deckSelect, deckClass]}>
          {deck}
        </Text>
      );
    }, R.keys(this.state.decks));

    var deckAction = this.state.selectedDeck === 'New Deck' ?
      (<TouchableElement style={styles.button}
        onPress={this.saveDeck}>
        <Text style={styles.buttonText}>Save Deck</Text>
      </TouchableElement>) :
      (<TouchableElement style={[styles.button, styles.buttonRed]}
        onPress={this.deleteDeck}>
        <Text style={[styles.buttonText, styles.buttonTextRed]}>Delete Deck</Text>
      </TouchableElement>);
    
    var addToDeck = this.state.selectedCardInCollection != null ?
      (<TouchableElement style={styles.button}
          onPress={this.addToDeck}>
          <Text style={styles.buttonText}>Add to Deck</Text>
       </TouchableElement>) : null;
    var removeFromDeck = this.state.selectedCardInDeck != null ?
      (<TouchableElement style={styles.button}
          onPress={this.removeFromDeck}>
          <Text style={styles.buttonText}>Remove from Deck</Text>
       </TouchableElement>) : null;

    return (
      <View style={styles.outerContainer}>
        <View style={styles.titleContainer}>
          <Text onPress={this.back} style={styles.navigation}>
            ⬅︎
          </Text>
          <Text style={styles.navigation}>
            Deck: {this.deck().length} / {MAX_DECK_SIZE}
          </Text>
          <Text onPress={this.next} style={styles.navigation}>
            Next
          </Text>
        </View>
        <View style={styles.deckList}>
          {decks}
        </View>
        <View style={[styles.scrollViewContainer, styles.deck]}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            {R.values(R.mapObjIndexed((card, i, deck) => {return (
              <PieceCard
                card={card}
                index={parseInt(i)}
                key={parseInt(i)}
                selected={R.equals(this.state.selectedCardInDeck, parseInt(i))}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                onPress={this.clickCardInDeck}/>
            )}, this.deck()))}
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          {deckAction}
        </View>
        <View style={styles.scrollViewContainer}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            {R.values(R.mapObjIndexed((card, i, deck) => {return (
              <PieceCard
                card={card}
                index={parseInt(i)}
                key={parseInt(i)}
                selected={R.equals(this.state.selectedCardInCollection, parseInt(i))}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}

                onPress={this.clickCardInCollection}/>
            )}, R.keys(Pieces)))}
          </ScrollView>
        </View>
        <PieceInfo piece={this.state.selectedPiece}></PieceInfo>
        <View style={styles.buttonContainer}>
          {addToDeck}
          {removeFromDeck}
        </View>
      </View>
    );
  }
});

var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;

var styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  pointText: {
    color: '#c4c4c4',
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
  },
  deck: {
    backgroundColor: '#3C3C3C',
    borderRadius: 10,
    margin: 10,
    padding: 10,
    height: cardHeight + 28,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#302F2F',
  },
  deckList: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  deckSelect: {
    fontSize: 12,
    color: '#646464',
    marginRight: 10,
  },
  deckSelected: {
    color: '#c4c4c4',
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
  button: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#c4c4c4',
    marginBottom: 10,
  },
  buttonRed: {
    borderColor: '#E5403F',
  },
  buttonTextRed: {
    color: '#E5403F',
  },
  buttonContainer: {
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
    color: '#c4c4c4',
  },
  titleContainer: {
    marginHorizontal: 20,
    marginVertical: 5,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  navigation: {
    marginVertical: 5,
    marginHorizontal: 10,
    color: '#c4c4c4',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

module.exports = DeckBuilder;
