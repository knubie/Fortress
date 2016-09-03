var React = require('react-native');
var R = require('ramda');
var PlayView = require('./PlayView');
var Builder = require('./Builder');
var DeckBuilder = require('./DeckBuilder');
var HowToPlay = require('./HowToPlay');
var Credits = require('./Credits');
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
  Image,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  NativeAppEventEmitter,
  Dimensions,
} = React;

var player = {};
var yourTurn = null;
var subscription;
var boardSize = 6;

var Home = React.createClass({
  componentDidMount: function() {
    subscription = NativeAppEventEmitter.addListener(
      'listMatches',
      data => {
        console.log('listMatches');
        console.log(data);
      }
    );
    subscription = NativeAppEventEmitter.addListener(
      'didFindMatch',
      data => {
        console.log('didFindMatch');
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
                  asleep: false,
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
                  asleep: false,
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
        console.log(data);
        this.loadMatch(game, baseGame, data.match.yourName, data.match.theirName, data.match.matchOutcome);
      }
    );
    GameCenterManager.clearMatch();
    // Load in a default preset deck.
    AsyncStorage.getItem('decks', (error, result) => {
      console.log(error);
      if (result == null) {
        var decks = {
          'New Deck': [],
          'Starter Deck': [
            'pin',
            'labor',
            'investment',
            'investment',
            'foreign aid',
            'foreign aid',
            'demotion',
            'fortify',
            'perception',
            'perception',
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
            'mine',
            'mine',
            'library',
            'factory',
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
  loadMatch: function(game, baseGame, yourName, theirName, matchOutcome) {
    var method = 'push';
    if (this.props.navigator.navigationContext._currentRoute.component.displayName === 'Home') {
      method = 'push';
    } else {
      //this.props.navigator.navigationContext._currentRoute.component.prototype.setState({game});
      method = 'replace';
    }
    console.log('matchOutcome: ' + matchOutcome);
    if (game.plys.length < 2 && yourTurn) {
      this.props.navigator.push({
        component: DeckBuilder,
        title: 'My Collection',
        passProps: ({
          game,
          yourTurn,
          decks: this.state.decks,
          route: 'DeckBuilder'
        }),
      });
    } else {
      this.props.navigator[method]({
        component: PlayView,
        title: 'Play the game',
        passProps: ({
          game,
          baseGame,
          yourTurn,
          yourName,
          theirName,
          matchOutcome,
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
  credits: function() {
    this.props.navigator.push({
      component: Credits,
      title: 'Credits'
    });
  },
  buildDeck: function() {
    game = Types.Game.of({
      turn: 'white',
      board: Types.Board.of({
        size: boardSize,
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
      passProps: ({game, decks: this.state.decks, myCollection: true}),
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
          <Image style={styles.logo} source={require('../assets/logo.png')} />
          <TouchableElement style={styles.button} onPress={this.newGame}>
            <Text style={styles.buttonText}>PLAY THE GAME</Text>
          </TouchableElement>
          <TouchableElement style={styles.button} onPress={this.buildDeck}>
            <Text style={styles.buttonText}>MY COLLECTION</Text>
          </TouchableElement>
          <TouchableElement style={styles.button} onPress={this.howToPlay}>
            <Text style={styles.buttonText}>HOW TO PLAY</Text>
          </TouchableElement>
          <TouchableElement style={styles.button} onPress={this.credits}>
            <Text style={styles.buttonText}>CREDITS</Text>
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
  logo: {
    transform: [
      {scale: 0.5}
    ],
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    //borderColor: '#c4c4c4',
    //borderColor: '#212121',
    //backgroundColor: '#c4c4c4',
    borderColor: '#191919',
    backgroundColor: '#191919',
    marginBottom: 20
  },
  buttonText: {
    fontFamily: 'Source Code Pro',
    fontWeight: '700',
    //color: '#212121',
    color: '#c4c4c4',
  }
});

module.exports = Home;

