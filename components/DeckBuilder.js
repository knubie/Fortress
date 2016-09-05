var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var Board = require('./Board');
var PlayView = require('./PlayView');
var Piece = require('./Piece');
var Square = require('./Square');
var PieceInfo = require('./PieceInfo.js');
var PieceCard = require('./PieceCard.js');
var PieceDisplay = require('../lib/piece-display');
var Chess = require('../engine/Main');
var Util = require('../engine/Util');
var Cards = require('../engine/Cards');
var Types = require('../engine/Types');
var PieceDisplay = require('../lib/piece-display');
var GameCenter = require('../back-ends/game-center')
var TitleBar = require('./TitleBar.js');
var CardIcon = require('./icons/Card');

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
} = ReactNative;

var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;
//console.log('cardWidth: ' + cardWidth);
//console.log('cardHeight: ' + cardHeight);

var boardSize = 8;

var MAX_DECK_SIZE = 30;
var HAND_SIZE = 4;
var DeckBuilder = React.createClass({
  getInitialState: function() {
    // The amount of the deck's scrollView offset. Used to calculate where
    // to place a card when it's dropped.
    this.deckScrollOffset = 0;


    this.startDragY = 0;
    this.startDragX = 0;
    this.draggedCardTop = 0;
    this.draggedCardLeft = 0;
    this.deckDropZoneLayout = {x:0, y:0, width:0, height:0};

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

      // The index of the card that's currently being dragged (so as to make
      // it 'invisible' ie. an empty slot, while it's dragging.
      invisibleCard: -1,

      // The name of the card that's currently being dragged.
      draggedCard: 'pawn',
      draggedCardTop: -100,
      draggedCardLeft: -100,
      draggedCardXY: new Animated.ValueXY(),
      deckWidth: new Animated.Value(0),
      cardHover: false,
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
          return drawHand(Util.drawCard(game.turn, game));
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
        // TODO: add names
        passProps: ({ game, baseGame: game, yourTurn: false }),
      });
    }
  },
  back: function() {
    this.props.navigator.pop();
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
    var save = (name) => {
      name = !name || name === 'New Deck' ? 'Untitled Deck' : name;
      //name = name || 'Untitled Deck';
      this.setState({
        decks: R.assoc(
          'New Deck',
          [],
          R.assoc(name, this.selectedDeck(), this.state.decks)
        ),
        selectedDeck: name
      });
      console.log(R.map(R.map(R.prop('name')), this.state.decks)),
      AsyncStorage.setItem(
        'decks',
        JSON.stringify(R.map(R.map(R.prop('name')), this.state.decks)),
        function(error) {
          console.log(error);
        }
      );
    }
    if (this.state.selectedDeck === 'New Deck') {
      AlertIOS.prompt('Save Deck', 'What do you want to call this deck?', save);
    } else {
      save(this.state.selectedDeck);
    }
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
          AsyncStorage.setItem(
            'decks',
            JSON.stringify(R.map(R.map(R.prop('name')), this.state.decks)),
            function(error) {
              console.log(error);
            }
          );
        }}
      ]
    );
  },
  onCollectionCardStartShouldSetResponder: function(e, card) {
    if ((2 - this.numberOfCardsInDeck(card)) < 2) {
      this.onDeckCardStartShouldSetResponder(e, card);
    }
  },
  onDeckCardResponderGrant: function(e, card, index, isDragging) {
    if (isDragging) {
      this.startDragX = e.nativeEvent.pageX;
      this.draggedCardTop = e.nativeEvent.pageY - e.nativeEvent.locationY;
      this.draggedCardLeft = e.nativeEvent.pageX - e.nativeEvent.locationX;
      this.setState({
        selectedCardInCollection: null,
        draggedCardTop: this.draggedCardTop,
        draggedCardLeft: this.draggedCardLeft,
        cardHover: true,
        decks:  R.assoc(
                  this.state.selectedDeck,
                  // Insert new null placeholder
                  R.insert(
                    index,
                    null,
                    // Remove any other null placeholders
                    R.filter(R.identity, R.remove(index, 1, this.selectedDeck()))
                  ),
                  this.state.decks
                )
        //invisibleCard: index,
      });
    } else {
      this.setState({
        enableDeckScroll: false,
      });
    }
  },
  onCollectionCardResponderGrant: function(e, card, index, isDragging) {
    if (isDragging) {
      if ((2 - this.numberOfCardsInDeck(card)) < 2) {
        this.startDragX = e.nativeEvent.pageX;
        this.draggedCardTop = e.nativeEvent.pageY - e.nativeEvent.locationY;
        this.draggedCardLeft = e.nativeEvent.pageX - e.nativeEvent.locationX;
        this.setState({
          selectedCardInCollection: null,
          selectedCardInDeck: null,
          draggedCardTop: this.draggedCardTop,
          draggedCardLeft: this.draggedCardLeft,
          cardHover: true,
        });
      }
    } else {
      this.setState({
        enableCollectionScroll: false,
      });
    }
  },
  onDeckCardStartShouldSetResponder: function(e, card) {
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;
    this.draggedCardTop = e.nativeEvent.pageY - e.nativeEvent.locationY;
    this.draggedCardLeft = e.nativeEvent.pageX - e.nativeEvent.locationX;
    this.state.draggedCardXY.setValue({x:0, y:0});
    this.setState({
      draggedCard: card,
    });
    return true;
  },
  // ScrollView should become responder in case Card is removed.
  onDeckMoveShouldSetResponder: function() {
    if (this.state.draggedCardTop > -100) {
      return true;
    } else {
      return false;
    }
  },
  // ScrollView responder just calls cardResponder.
  onDeckResponderMove: function(e) {
    if (this.state.draggedCardTop > -100) {
      this.onCardResponderMove(e)
    } else {
      return false;
    }
  },
  // ScrollView responder just calls cardResponder.
  onDeckResponderRelease: function(e) {
    this.onCardResponderRelease(e);
  },
  onCardResponderRelease: function(e, card) {
    var e = e;
    var dragIndex = this.getDragIndex(e);

    // At which point along the y axis the card has crossed over to the
    // deck scrollView.
    //var verticalThreshold = 170;
    var verticalThreshold = this.deckDropZoneLayout.y + this.deckDropZoneLayout.height;
    console.log(verticalThreshold);

    // Where the card will be placed when it's released.
    var yPlacement = this.deckDropZoneLayout.y + 14;
    //var yPlacement = 78.5;
    if (e.nativeEvent.pageY < verticalThreshold && this.state.draggedCardTop > -100 && dragIndex > -1) {
      var left = -24 + this.deckScrollOffset;
      this.setState({
        cardHover: false,
      });
      Animated.timing(this.state.draggedCardXY, {
        toValue: {
          x: ((dragIndex * (cardWidth + 10)) - left) - this.state.draggedCardLeft,
          y: yPlacement - this.state.draggedCardTop,
        },
        duration: 100,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }).start((result) => {
        var filteredDeck = R.filter(R.identity, this.selectedDeck());
        // Delay the remove over the draggedCard to avoid flickering.
        requestAnimationFrame(() => {
          this.setState({
            draggedCardTop: -100,
            draggedCardLeft: -100,
          });
        });
        this.setState({
          enableCollectionScroll: true,
          enableDeckScroll: true,
          decks:  R.assoc(
                    this.state.selectedDeck,
                    // Insert new null placeholder
                    R.insert(
                      dragIndex,
                      {
                        name: this.state.draggedCard,
                        key: filteredDeck.length < 1 ? 0 :
                               (Math.max.apply(null, R.map(R.prop('key'), filteredDeck)) + 1)
                      },
                      // Remove any other null placeholders
                      filteredDeck
                    ),
                    this.state.decks
                  )
        });
      });
    } else {
      this.state.draggedCardXY.setValue({x:0, y:0});
      this.setState({
        cardHover: false,
        enableCollectionScroll: true,
        enableDeckScroll: true,
        draggedCardTop: -100,
        draggedCardLeft: -100,
      });
    }
  },
  getDragIndex: function(e) {
    var left = -24 + this.deckScrollOffset;
    var margin = 10;
    var dragIndex = Math.round((e.nativeEvent.pageX + left) / (cardWidth + margin));
    var invisibleCard = this.selectedDeck().indexOf(null) !== -1 ? this.selectedDeck().indexOf(null) : this.state.invisibleCard;
    // TODO: change this to nullIndex instead of invisibleCard.
    dragIndex = invisibleCard !== -1 && dragIndex - 1 >= invisibleCard ? dragIndex - 1 : dragIndex;
    return R.min(this.selectedDeck().length, dragIndex);
  },
  insertPlaceholderCard: function(index) {
    if (this.selectedDeck()[index] != null) {
      this.setState({
        decks:  R.assoc(
                  this.state.selectedDeck,
                  // Insert new null placeholder
                  R.insert(
                    index,
                    null,
                    // Remove any other null placeholders
                    R.filter(R.identity, this.selectedDeck())
                  ),
                  this.state.decks
                )
      });
    }
  },
  removePlaceholderCard: function() {
    // If null placeholder exists.
    if (this.selectedDeck().indexOf(null) !== -1) {
      this.setState({
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.filter(R.identity, this.selectedDeck()),
                  this.state.decks
                )
      });
    }
  },
  updateDraggedCard: function(e) {
    Animated.timing(
      this.state.draggedCardXY, {
      toValue: {
        x: e.nativeEvent.pageX - this.startDragX,
        y: e.nativeEvent.pageY - this.startDragY,
      },
      duration: 100,
      delay: 0,
      easing: Easing.out(Easing.ease),
    }).start();
  },
  onCardResponderMove: function(e, card) {
    if (card == null || (2 - this.numberOfCardsInDeck(card)) < 2) {
      this.updateDraggedCard(e);
      // If dragging inside the mat
      if (e.nativeEvent.pageY < 170) {
        this.insertPlaceholderCard(this.getDragIndex(e));
      // If dragging outside the mat.
      } else {
        this.removePlaceholderCard();
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
      return this.selectedDeck()[this.state.selectedCardInDeck].name;
    } else {
      return null;
    }
  },
  numberOfCardsInDeck: function(card) {
    return 2 - R.filter(R.equals(card), R.map(R.prop('name'), R.filter(R.identity, this.selectedDeck()))).length;
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }

    var decks = R.map(deck => {
      var deckClass = deck === this.state.selectedDeck ? styles.deckSelected : null;
      var cardIconStyle = deck === this.state.selectedDeck ? null : {opacity: 0.4};
      return (
        <View style={[{
          paddingHorizontal: 9,
          backgroundColor: '#181818',
          borderRadius: 7,
          height: 27,
          marginRight: 10,
          marginBottom: 7,
        }]}>
          <Text onPress={this.selectDeck.bind(this, deck)} style={[styles.deckSelect, deckClass]}>
          <CardIcon number={''} customStyle={cardIconStyle}/>  {deck}
          </Text>
        </View>
      );
    }, R.keys(this.state.decks));

    var deckAction = this.state.selectedDeck === 'New Deck' ?
      (<TouchableElement style={styles.button}
        onPress={this.saveDeck}>
        <Text style={styles.buttonText}>Save Deck</Text>
      </TouchableElement>) :
      (<View style={{flexWrap: 'wrap', flexDirection: 'row',}}>
        <TouchableElement style={styles.button}
          onPress={this.saveDeck}>
          <Text style={styles.buttonText}>Save Deck</Text>
        </TouchableElement>
        <TouchableElement style={[styles.button, styles.buttonRed]}
          onPress={this.deleteDeck}>
          <Text style={[styles.buttonText, styles.buttonTextRed]}>Delete Deck</Text>
        </TouchableElement>
      </View>);
    
    // This is the card that gets dragged around the screen.
    var draggedCard = (
      <Animated.View
        style={[
          styles.draggedCard,
          {
            'left': this.state.draggedCardLeft,
            'top': this.state.draggedCardTop,
            'transform': this.state.draggedCardXY.getTranslateTransform()
          }
        ]}
      >
        <PieceCard
          card={this.state.draggedCard}
          index={0}
          key={0}
          selected={false}
          hover={this.state.cardHover}
        />
      </Animated.View>
    );

    return (
      <View style={styles.outerContainer}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'Deck: ' + this.selectedDeck().length + ' / ' + MAX_DECK_SIZE}
          rightText={this.props.myCollection ? '' : 'Next'}
        />
        <View style={styles.deckList}>
          {decks}
        </View>
        <View
          style={[styles.scrollViewContainer, styles.deck]}
          onLayout={(e) => {
            this.deckDropZoneLayout = e.nativeEvent.layout;
          }}
        >
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
                onStartShouldSetResponder={this.onDeckCardStartShouldSetResponder}
                onResponderGrant={this.onDeckCardResponderGrant}
                onResponderMove={this.onCardResponderMove}
                onResponderRelease={this.onCardResponderRelease}
                onPress={this.clickCardInDeck}
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
                count={this.numberOfCardsInDeck(card.name)}
                selected={R.equals(this.state.selectedCardInCollection, parseInt(i))}
                onStartShouldSetResponder={this.onCollectionCardStartShouldSetResponder}
                onResponderGrant={this.onCollectionCardResponderGrant}
                onResponderRelease={this.onCardResponderRelease}
                onResponderMove={this.onCardResponderMove}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}

                onPress={this.clickCardInCollection}/>
            )}, this.state.collection)))}
          </ScrollView>
        </View>
        <PieceInfo
          card={this.getSelectedCard()}
        ></PieceInfo>
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
  },
  deckSelected: {
    fontSize: 12,
    color: '#c4c4c4',
  },
  scrollViewContainer: {
    height: cardHeight + 30,
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
    marginHorizontal: 5,
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
