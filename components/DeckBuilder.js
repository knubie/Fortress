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
var Cards = require('../engine/Cards');
var Types = require('../engine/Types');
var PieceDisplay = require('../lib/piece-display');
var GameCenter = require('../back-ends/game-center')
var TitleBar = require('./TitleBar.js');

var {
  Animated,
  Easing,
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

var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;

var boardSize = 8;

var MAX_DECK_SIZE = 20;
var HAND_SIZE = 4;
var DeckBuilder = React.createClass({
  getInitialState: function() {
    this.deckScrollOffset = 0;
    this.startDragY = 0;
    this.startDragX = 0;
    this.draggedCardTop = 0;
    this.draggedCardLeft = 0;
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      selectedCardInDeck: null,
      selectedCardInCollection: null,
      game: this.props.game,
      //decks: this.props.decks,
      decks: R.map((deck) => {
        return R.values(R.mapObjIndexed((card, i) => { return {name: card, key: i}; }, deck));
      }, this.props.decks),
      collection: R.values(R.mapObjIndexed((card, i) => {
        return {name: card, key: i};
      }, R.keys(Cards))),
      selectedDeck: 'New Deck',
      enableCollectionScroll: true,
      enableDeckScroll: true,
      invisibleCard: -1,
      draggedCard: 'pawn',
      showDraggedCard: false,
      draggedCardTop: -100,
      draggedCardLeft: -100,
      draggedCardY: 0,
      draggedCardX: 0,
      deckWidth: new Animated.Value(0),
    }
  },
  componentWillMount: function() {
    this.state.deckWidth.setValue((cardWidth + 10) * this.selectedDeck().length);

  },
  componentWillUpdate: function(nextProps, nextState) {
    if (this.selectedDeck().length !== nextState.decks[nextState.selectedDeck].length) {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.deckWidth,                 // Animate `bounceValue`
        {
          toValue: (cardWidth + 10) * nextState.decks[nextState.selectedDeck].length,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.out(Easing.ease),
        }
      ).start();
    }
  },
  selectedDeck: function() {
    return this.state.decks[this.state.selectedDeck] || [];
  },
  next: function() {
    var oppositeColor = function(color) {
      return color === 'white' ? 'black' : 'white';
    }
    if (this.selectedDeck().length > MAX_DECK_SIZE) {
      alert('You have too many cards.');
    } else {
      // TODO move this into the engine.
      //var colorIndex = Chess.colorToIndex(this.state.game.turn);
      var colorIndex = this.state.game.turn === 'white' ? 0 : 1;
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
      // Update decks with user's created deck
      }, drawHand(R.assoc(
        'decks',
        adjust(
          always(
            Chess.shuffle(
              // Turn deck into [String]
              R.map(R.prop('name'), this.selectedDeck())
            )
          ),
          colorIndex,
          this.state.game.decks
        ),
        this.state.game)
      )));
      GameCenter.endTurnWithGame(game);
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
    //if (this.state.selectedCardInDeck != null) {
      //this.setState({
        //selectedCardInDeck: null,
        //decks:  R.assoc(
                  //this.state.selectedDeck,
                  //R.remove(
                    //this.state.selectedCardInDeck, 1,
                    //this.selectedDeck()
                  //),
                  ////R.append(this.state.selectedPiece.name, this.selectedDeck()),
                  //this.state.decks
                //)
      //});
    //}
  },
  addToDeck: function() {
    //if (this.state.selectedCardInCollection != null) {
      //this.setState({
        //decks:  R.assoc(
                  //this.state.selectedDeck,
                  //R.prepend(R.keys(Cards)[this.state.selectedCardInCollection], this.selectedDeck()),
                  //this.state.decks
                //)
      //});
    //}
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
        decks: R.assoc('New Deck', [], R.assoc(name, this.selectedDeck(), this.state.decks)),
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
  onCollectionCardStartShouldSetResponder: function(e, card) {
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;
    this.draggedCardTop = e.nativeEvent.pageY - e.nativeEvent.locationY;
    this.draggedCardLeft = e.nativeEvent.pageX - e.nativeEvent.locationX;
    this.setState({
      draggedCard: card,
      draggedCardX: 0,
      draggedCardY: 0,
    });
  },
  onDeckCardResponderGrant: function(e, card, index) {
    this.setState({
      selectedCardInCollection: null,
      draggedCardTop: this.draggedCardTop,
      draggedCardLeft: this.draggedCardLeft,
      enableDeckScroll: false,
      invisibleCard: index,
    });
  },
  onCollectionCardResponderGrant: function(e, card, index) {
    this.setState({
      selectedCardInDeck: null,
      selectedCardInCollection: null,
      enableCollectionScroll: false,
      draggedCardTop: this.draggedCardTop,
      draggedCardLeft: this.draggedCardLeft,
    });
  },
  onDeckMoveShouldSetResponder: function() {
    if (this.state.draggedCardTop > -100) {
      return true;
    } else {
      return false;
    }
  },
  onDeckResponderMove: function(e) {
    if (this.state.draggedCardTop > -100) {
      this.onDeckCardResponderMove(e)
    } else {
      return false;
    }
  },
  onDeckResponderRelease: function(e) {
    this.onDeckCardResponderRelease(e);
  },
  onDeckCardResponderRelease: function(e, card) {
    this.setState({
      enableDeckScroll: true,
      draggedCard: 'pawn',
      draggedCardTop: -100,
      draggedCardLeft: -100,
      invisibleCard: -1,
      removeInvisibleCard: null,
    });
  },
  onCollectionCardResponderRelease: function(e, card) {
    //FIXME: don't hardcode this!
    var left = -24 + this.deckScrollOffset;
    var margin = 10;
    var dragIndex = Math.round((e.nativeEvent.pageX + left) / (cardWidth + margin));
    dragIndex = this.state.invisibleCard !== -1 && dragIndex - 1 >= this.state.invisibleCard ? dragIndex - 1 : dragIndex;
    //var dragIndex = Math.floor(((e.nativeEvent.pageX + left) + ((cardWidth / 2) + margin)) / (cardWidth + margin));
    if (e.nativeEvent.pageY < 170 && this.state.draggedCardTop > -100) {
      this.setState({
        enableCollectionScroll: true,
        draggedCard: 'pawn',
        draggedCardTop: -100,
        draggedCardLeft: -100,
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.insert(
                    R.min(
                      this.selectedDeck().length,
                      dragIndex
                    ),
                    {name: card, key: R.filter(R.identity, this.selectedDeck()).length < 1 ? 0 : (Math.max.apply(null, R.map(R.prop('key'), R.filter(R.identity, this.selectedDeck()))) + 1)},
                    // Remove any null placeholders
                    R.filter(R.identity, this.selectedDeck())
                    //this.selectedDeck()
                  ),
                  this.state.decks
                )
      });
    } else {
      this.setState({
        enableCollectionScroll: true,
        draggedCard: 'pawn',
        draggedCardTop: -100,
        draggedCardLeft: -100,
      });
    }
  },
  onDeckCardResponderMove: function(e, card) {
    this.setState({
      draggedCardX: e.nativeEvent.pageX - this.startDragX,
      draggedCardY: e.nativeEvent.pageY - this.startDragY,
    });
    if (e.nativeEvent.pageY > 170) {
      if (!this.state.removeInvisibleCard) {
        this.setState({
          // TODO: this is misleadin because the card count will still reflect
          // the card being in the deck.
          removeInvisibleCard: this.selectedDeck()[this.state.invisibleCard],
          invisibleCard: -1,
          decks:  R.assoc(
                    this.state.selectedDeck,
                    R.remove(this.state.invisibleCard, 1, this.selectedDeck()),
                    this.state.decks
                  )
          //decks:  R.assoc(
                    //this.state.selectedDeck,
                    //R.append(
                      //this.selectedDeck()[this.state.invisibleCard],
                      //R.remove(this.state.invisibleCard, 1, this.selectedDeck())
                    //),
                    //this.state.decks
                  //)
        });
      }
    } else {
      var left = -24 + this.deckScrollOffset;
      var margin = 10;
      var dragIndex = Math.round((e.nativeEvent.pageX + left) / (cardWidth + margin));
      dragIndex = this.state.invisibleCard !== -1 && dragIndex - 1 >= this.state.invisibleCard ? dragIndex - 1 : dragIndex;
      //var dragIndex = Math.floor(((e.nativeEvent.pageX + left) + ((cardWidth / 2) + margin)) / (cardWidth + margin));
      //var normalized
      if (this.state.removeInvisibleCard) {
        this.setState({
          removeInvisibleCard: null,
          invisibleCard: R.min(
                           this.selectedDeck().length - 1,
                           dragIndex
                         ),
          decks:  R.assoc(
                    this.state.selectedDeck,
                    R.insert(
                      R.min(
                        this.selectedDeck().length - 1,
                        dragIndex
                      ),
                      this.state.removeInvisibleCard,
                      this.selectedDeck()
                    ),
                    this.state.decks
                  )
        });
      } else if (R.min(this.selectedDeck().length - 1, dragIndex) !== this.state.invisibleCard) {
        this.setState({
          invisibleCard: R.min(this.selectedDeck().length - 1, dragIndex),
          decks:  R.assoc(
                    this.state.selectedDeck,
                    R.insert(
                      R.min(
                        this.selectedDeck().length - 1,
                        dragIndex
                      ),
                      this.selectedDeck()[this.state.invisibleCard],
                      R.remove(this.state.invisibleCard, 1, this.selectedDeck())
                    ),
                    this.state.decks
                  )
        });
      }
    }
  },
  onCollectionCardResponderMove: function(e, card) {
    var left = -24 + this.deckScrollOffset;
    var margin = 10;

    var dragIndex = Math.round((e.nativeEvent.pageX + left) / (cardWidth + margin));
    dragIndex = this.state.invisibleCard !== -1 && dragIndex - 1 >= this.state.invisibleCard ? dragIndex - 1 : dragIndex;
    //var dragIndex = Math.floor(((e.nativeEvent.pageX + left) + ((cardWidth / 2) + margin)) / (cardWidth + margin));
    var selectedDeck = this.selectedDeck();
    var nullIndex = this.selectedDeck().indexOf(null);
    if (e.nativeEvent.pageY < 170) {
      if (selectedDeck[dragIndex] != null) {
        this.setState({
          draggedCardX: e.nativeEvent.pageX - this.startDragX,
          draggedCardY: e.nativeEvent.pageY - this.startDragY,
          decks:  R.assoc(
                    this.state.selectedDeck,
                    R.insert(
                      R.min(
                        this.selectedDeck().length,
                        dragIndex
                      ),
                      null,
                      R.filter(R.identity, this.selectedDeck())
                    ),
                    this.state.decks
                  )
        });
      } else {
        this.setState({
          draggedCardX: e.nativeEvent.pageX - this.startDragX,
          draggedCardY: e.nativeEvent.pageY - this.startDragY,
        });
      }
    } else {
      if (nullIndex !== -1) {
        console.log('removing null');
        this.setState({
          draggedCardX: e.nativeEvent.pageX - this.startDragX,
          draggedCardY: e.nativeEvent.pageY - this.startDragY,
          decks:  R.assoc(
                    this.state.selectedDeck,
                    R.filter(R.identity, this.selectedDeck()),
                    this.state.decks
                  )
        });
      } else {
        this.setState({
          draggedCardX: e.nativeEvent.pageX - this.startDragX,
          draggedCardY: e.nativeEvent.pageY - this.startDragY,
        });
      }
    }
  },
  onDeckScroll: function(e) {
    this.deckScrollOffset = e.nativeEvent.contentOffset.x;
  },
  getSelectedCard: function() {
    if (this.state.selectedCardInCollection != null) {
      return this.state.collection[this.state.selectedCardInCollection].name;
    } else if (this.state.selectedCardInDeck != null) {
      return this.selectedDeck()[this.state.selectedCardInCollection].name;
    } else {
      return null;
    }
  },
  render: function() {
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

    var draggedCard = (
      <PieceCard
        card={this.state.draggedCard}
        index={0}
        key={0}
        selected={false}
        hover={this.state.draggedCardTop > -100}
        style={[
          styles.draggedCard,
          {
            'left': this.state.draggedCardLeft,
            'top': this.state.draggedCardTop,
            'transform': [
              {translateX: this.state.draggedCardX},
              {translateY: this.state.draggedCardY},
            ],
          }
        ]}
      />
    );

    return (
      <View style={styles.outerContainer}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'Deck: ' + this.selectedDeck().length + ' / ' + MAX_DECK_SIZE}
          rightText={'Next'}
        />
        <View style={styles.deckList}>
          {decks}
        </View>
        <View style={[styles.scrollViewContainer, styles.deck]}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      onScroll={this.onDeckScroll}
                      showsHorizontalScrollIndicator={false}
                      scrollEnabled={this.state.enableDeckScroll}
                      scrollEventThrottle={16}
                      onMoveShouldSetResponder={this.onDeckMoveShouldSetResponder}
                      onResponderMove={this.onDeckResponderMove}
                      onResponderRelease={this.onDeckResponderRelease}
                      contentContainerStyle={styles.scrollView}>
            <Animated.View style={{width: this.state.deckWidth}}/>
            {R.reverse(R.values(R.mapObjIndexed((card, i, deck) => {return card == null ? null : (
              <PieceCard
                card={card.name}
                index={parseInt(i)}
                invisible={parseInt(i) === this.state.invisibleCard}
                key={parseInt(card.key)}
                selected={R.equals(this.state.selectedCardInDeck, parseInt(i))}
                left={(cardWidth + 10) * parseInt(i)}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                onStartShouldSetResponder={this.onCollectionCardStartShouldSetResponder}
                onResponderGrant={this.onDeckCardResponderGrant}
                onResponderMove={this.onDeckCardResponderMove}
                onResponderRelease={this.onDeckCardResponderRelease}
                //onPress={this.clickCardInDeck}
              />
            )}, this.selectedDeck())))}
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          {deckAction}
        </View>
        <View style={styles.scrollViewContainer}>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      snapToInterval={cardWidth + 10}
                      scrollEnabled={this.state.enableCollectionScroll}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            <View style={{
              width: (cardWidth + 10) * this.state.collection.length
            }}/>
            {R.reverse(R.values(R.mapObjIndexed((card, i, deck) => {return (
              <PieceCard
                card={card.name}
                index={parseInt(i)}
                key={parseInt(card.key)}
                left={(cardWidth + 10) * parseInt(i)}
                selected={R.equals(this.state.selectedCardInCollection, parseInt(i))}
                onStartShouldSetResponder={this.onCollectionCardStartShouldSetResponder}
                onResponderGrant={this.onCollectionCardResponderGrant}
                onResponderRelease={this.onCollectionCardResponderRelease}
                onResponderMove={this.onCollectionCardResponderMove}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}

                onPress={this.clickCardInCollection}/>
            )}, this.state.collection)))}
          </ScrollView>
        </View>
        <PieceInfo
          card={this.getSelectedCard()}
        ></PieceInfo>
        <View style={styles.buttonContainer}>
          {addToDeck}
          {removeFromDeck}
        </View>
        {draggedCard}
      </View>
    );
  }
});

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
  draggedCard: {
    position: 'absolute',
    //top: 240,
    //left: 0,
    backgroundColor: 'rgba(0,0,0,0)',
  },
});

module.exports = DeckBuilder;
