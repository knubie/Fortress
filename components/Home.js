var React = require('react-native');
var R = require('ramda');
var PlayView = require('./PlayView');
var Builder = require('./Builder');
var DeckBuilder = require('./DeckBuilder');
var HowToPlay = require('./HowToPlay');
var Types = require('../engine/Types');
var GameCenterManager = React.NativeModules.GameCenterManager;
var GameCenterViewController = React.NativeModules.GameCenterViewController;
var { NativeAppEventEmitter } = require('react-native');

var GameCenter = require('../back-ends/game-center')

var {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  NativeAppEventEmitter,
} = React;

var player = {};
var yourTurn = null;
var subscription;

var Home = React.createClass({
  componentDidMount: function() {
    var boardSize = 7;
    subscription = NativeAppEventEmitter.addListener(
      'didFindMatch',
      data => {
        // data.match {
        //   matchID: String
        //   yourTurn: Boolean
        //   newMatch: Boolean
        // }
        var game = {};
        var baseGame = {};
        yourTurn = data.match.yourTurn;
        if (data.match.newMatch) {
          game = Types.Game.of({
            turn: 'white',
            matchID: data.match.matchID,
            board: Types.Board.of({
              size: boardSize,
              pieces: [
                Types.Piece.of({
                  name: 'king',
                  color: 'white',
                  position: Types.Position.of({x: 3, y: 0}),
                  key: 0,
                }),
                //Types.Piece.of({
                  //name: 'mine',
                  //color: 'white',
                  //position: Types.Position.of({x: 4, y: 0}),
                  //key: 1,
                //}),
                Types.Piece.of({
                  name: 'king',
                  color: 'black',
                  position: Types.Position.of({x: 3, y: boardSize - 1}),
                  key: 2,
                }),
                //Types.Piece.of({
                  //name: 'mine',
                  //color: 'black',
                  //position: Types.Position.of({x: 4, y: boardSize - 1}),
                  //key: 3,
                //}),
              ]
            }),
            resources: [2, 2],
            plys: []
          });
          baseGame = game;
        } else {
          // TODO: update this
          game = GameCenter.decode(data.match.matchData);
          baseGame = GameCenter.getBaseGame(data.match.matchData);
        }
        if (data.match.yourTurn) {
          player.color = game.turn;
        }
        this.loadMatch(game, baseGame);
      }
    );
    GameCenterManager.clearMatch();
    // Load in a default preset deck.
    AsyncStorage.getItem('decks', (error, result) => {
      console.log(error);
      console.log(result);
      if (result == null) {
        var decks = {
          'New Deck': [],
          'Starter Deck': [
            'pawn',
            'pawn',
            'pawn',
            'pawn',
            'pawn',
            'pawn',
            'bishop',
            'bishop',
            'knight',
            'knight',
            'rook',
            'rook',
            'queen',
            'king',
            'wall',
            'wall',
            'teleporter',
            'bomber',
            'ranger',
            'archbishop',
          ]
        };
        AsyncStorage.setItem('decks', JSON.stringify(decks), (error) => {
          console.log(error);
        });
        this.setState({
          decks: decks,
        });
      } else {
        this.setState({
          decks: JSON.parse(result),
        });
      }
    });
  },
  getInitialState: function() {
    return {};
  },
  componentWillUnmount: function() {
    subscription.remove();
  },
  loadMatch: function(game, baseGame) {
    var method = 'push';
    if (this.props.navigator.navigationContext._currentRoute.component.displayName === 'Home') {
      method = 'push';
    } else {
      //this.props.navigator.navigationContext._currentRoute.component.prototype.setState({game});
      method = 'replace';
    }
    if (game.plys.length < 2 && yourTurn) {
    this.props.navigator.push({
      component: DeckBuilder,
      title: 'My Collection',
      passProps: ({ game, yourTurn, decks: this.state.decks, route: 'DeckBuilder' }),
    });
    } else {
      this.props.navigator[method]({
        component: PlayView,
        title: 'Play the game',
        passProps: ({
          game,
          baseGame,
          yourTurn,
          decks: this.state.decks,
          route: 'PlayView'
        }),
      });
    }
  },
  newGame: function() {
    GameCenterManager.newMatch();
  },
  howToPlay: function() {
    this.props.navigator.push({
      component: HowToPlay,
      title: 'How to play'
    });
  },
  buildDeck: function() {
    game = Types.Game.of({
      turn: 'white',
      board: Types.Board.of({
        size: 8,
        pieces: [
          Types.Piece.of({
            name: 'king',
            color: 'white',
            position: Types.Position.of({x: 3, y: 0}),
            key: 0,
          }),
          Types.Piece.of({
            name: 'king',
            color: 'black',
            position: Types.Position.of({x: 3, y: 7}),
            key: 1,
          }),
        ]
      }),
      resources: [20, 20],
      plys: []
    });
    this.props.navigator.push({
      component: DeckBuilder,
      title: 'My Collection',
      passProps: ({game, decks: this.state.decks}),
    });
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    return (
      <View style={styles.containerContainer}>
        <View style={styles.container}>
          <TouchableElement style={styles.button} onPress={this.newGame}>
            <Text style={styles.buttonText}>Play the Game</Text>
          </TouchableElement>
          <TouchableElement style={styles.button} onPress={this.buildDeck}>
            <Text style={styles.buttonText}>My Collection</Text>
          </TouchableElement>
          <TouchableElement style={styles.button} onPress={this.howToPlay}>
            <Text style={styles.buttonText}>How to Play</Text>
          </TouchableElement>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  containerContainer: {
    flex: 1,
    backgroundColor: '#212121',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#c4c4c4',
    marginBottom: 10
  },
  buttonText: {
    color: '#c4c4c4',
  }
});

module.exports = Home;

