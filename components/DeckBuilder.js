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
      selectedPiece: null,
      game: this.props.game,
      selectedDeck: 'New Deck',
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
    if (this.deck().length > 20) {
      alert('You have too many cards.');
    } else {
      var game = Types.Game.of(R.evolve({
        board: compose(
                Types.Board.of,
                evolve({pieces: R.concat(this.deck())})
               ),
        turn: oppositeColor,
        plys: R.append('draft'),
      }, this.state.game));
      GameCenter.endTurnWithNextParticipants(game);
      this.props.navigator.replace({
        component: PlayView,
        title: 'Play the game',
        passProps: ({ game, yourTurn: false }),
      });
    }
  },
  removeFromDeck: function() {
    if (this.state.selectedPiece) {
      this.setState({
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.remove(
                    R.indexOf(
                      this.state.selectedPiece.name,
                      this.state.decks[this.state.selectedDeck]
                    ), 1,
                    this.state.decks[this.state.selectedDeck]
                  ),
                  //R.append(this.state.selectedPiece.name, this.state.decks[this.state.selectedDeck]),
                  this.state.decks
                )
      });
      //this.setState({
        //game: Types.Game.of(evolve({
          //board:  compose(
                    //Types.Board.of,
                    //evolve({
                      //pieces: R.without([this.state.selectedPiece])
                    //})
                  //)
        //}, this.state.game))
      //});
      console.log(this.state);
      //this.setState({
        //pieces: R.append(this.state.selectedPiece, this.state.pieces)
      //});
    }
  },
  addToDeck: function() {
    if (this.state.selectedPiece) {
      //var piece = Types.Piece.of(R.assoc(
        //'key', R.reduce(R.compose(R.add(1), R.max), 0, R.map(R.prop('key'), this.deck()))
      //, this.state.selectedPiece));
      //this.setState({
        //game: Types.Game.of(evolve({
          //board:  compose(
                    //Types.Board.of,
                    //evolve({
                      //pieces: R.append(piece)
                    //})
                  //)
        //}, this.state.game))
      //});
      this.setState({
        decks:  R.assoc(
                  this.state.selectedDeck,
                  R.append(this.state.selectedPiece.name, this.state.decks[this.state.selectedDeck]),
                  this.state.decks
                )
      });
      console.log(this.state);
      //this.setState({
        //pieces: R.append(this.state.selectedPiece, this.state.pieces)
      //});
    }
  },
  clickCard: function(piece) {
    this.setState({
      selectedPiece: piece,
    });
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
  back: function() {
    this.props.navigator.pop();
  },
  deck: function() {
    if (this.state.decks && this.state.decks[this.state.selectedDeck]) {
      //var piece = Types.Piece.of(R.assoc(
        //'key', R.reduce(R.compose(R.add(1), R.max), 0, R.map(R.prop('key'), this.deck()))
      //, this.state.selectedPiece));
      var i = 0;
      return R.map(name => {
        i = i - 1;
        return Types.Piece.of({
          name: name,
          color: this.state.game.turn,
          position: Types.Position.of({x: -1, y: -1}),
          key: i,
        });
      }, this.state.decks[this.state.selectedDeck]);
    } else {
      return [];
    }
    //return R.filter((piece) => {
      //return (piece.color === this.state.game.turn && piece.position.x < 0 && piece.position.y < 0);
    //}, this.state.game.board.pieces);
  },
  selectDeck: function(deck) {
    this.setState({selectedDeck: deck});
  },
  saveDeck: function() {
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

    var allCards = R.map( name => {
      return Types.Piece.of({
        name: name,
        color: this.props.game.turn,
        position: Types.Position.of({x: -1, y: -1})
      });
    }, R.keys(Pieces));

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

    return (
      <View style={styles.outerContainer}>
        <View style={styles.titleContainer}>
          <Text onPress={this.back} style={styles.navigation}>
            ⬅︎
          </Text>
          <Text style={styles.navigation}>
            Deck: {this.deck().length} / 20
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
            {R.map((piece) => {return (
              <PieceCard
                piece={piece}
                selected={R.equals(this.state.selectedPiece, piece)}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                onPress={this.clickCard}/>
            )}, this.deck())}
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
            {R.map((piece) => {return (
              <PieceCard
                piece={piece}
                selected={R.equals(this.state.selectedPiece, piece)}
                //disabled={this.state.game.resources[this.colorToIndex(this.state.playerColor)] < piece.points}
                onPress={this.clickCard}/>
            )}, allCards)}
          </ScrollView>
        </View>
        <PieceInfo piece={this.state.selectedPiece}></PieceInfo>
        <View style={styles.buttonContainer}>
          {this.state.selectedPiece ? 
            <TouchableElement style={styles.button}
              onPress={this.state.selectedPiece.key != null ? this.removeFromDeck : this.addToDeck}>
              <Text style={styles.buttonText}>{this.state.selectedPiece.key != null ? 'Remove From Deck' : 'Add To Deck'}</Text>
            </TouchableElement> : null}
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
