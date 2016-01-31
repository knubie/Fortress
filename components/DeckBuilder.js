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
  getInitialState: function() {
    return {
      pieces: [ ],
      points: 0,
      royals: 0,
      selectedPiece: null,
      game: this.props.game,
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
        game: Types.Game.of(evolve({
          board:  compose(
                    Types.Board.of,
                    evolve({
                      pieces: R.without([this.state.selectedPiece])
                    })
                  )
        }, this.state.game))
      });
      console.log(this.state.game);
      //this.setState({
        //pieces: R.append(this.state.selectedPiece, this.state.pieces)
      //});
    }
  },
  addToDeck: function() {
    if (this.state.selectedPiece) {
      var piece = Types.Piece.of(R.assoc(
        'key', R.reduce(R.compose(R.add(1), R.max), 0, R.map(R.prop('key'), this.deck()))
      , this.state.selectedPiece));
      this.setState({
        game: Types.Game.of(evolve({
          board:  compose(
                    Types.Board.of,
                    evolve({
                      pieces: R.append(piece)
                    })
                  )
        }, this.state.game))
      });
      console.log(this.state.game);
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
    return R.filter((piece) => {
      return (piece.color === this.state.game.turn && piece.position.x < 0 && piece.position.y < 0);
    }, this.state.game.board.pieces);
  },
  render: function() {
    var _this = this;
    var allCards = R.map( name => {
      return Types.Piece.of({
        name: name,
        color: this.props.game.turn,
        position: Types.Position.of({x: -1, y: -1})
      });
    }, R.keys(Pieces));

    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
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
