var React = require('react-native');
var Builder = require('./Builder');
var Board = require('./Board');
var MapView = require('./MapView');
var R = require('ramda');
//var Board = require('./Board');
//var Builder = require('./Builder');
var Types = require('../engine/Types');
var GameCenterManager = React.NativeModules.GameCenterManager;
var GameCenterViewController = React.NativeModules.GameCenterViewController;
var { NativeAppEventEmitter } = require('react-native');

var GameCenter = require('../back-ends/game-center')

var {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
} = React;

var player = {};
var yourTurn = null;
var subscription;

var Home = React.createClass({
  componentDidMount: function() {
    subscription = NativeAppEventEmitter.addListener(
      'didFindMatch',
      data => {
        console.log(data.match);
        // data.match {
        //   matchID: String
        //   yourTurn: Boolean
        //   newMatch: Boolean
        // }
        var game = {};
        yourTurn = data.match.yourTurn;
        if (data.match.newMatch) {
          game = Types.Game.of({
            turn: 'white',
            matchID: data.match.matchID,
            board: Types.Board.of({
              size: 8,
              pieces: []
            }),
            plys: []
          });
        } else {
          console.log(data.match.matchData);
          game = GameCenter.decode(data.match.matchData);
        }
        if (data.match.yourTurn) {
          player.color = game.turn;
        }
        this.loadMatch(game);
      }
    );
  },
  componentWillUnmount: function() {
    subscription.remove();
  },
  loadMatch: function(game) {
    console.log(game);
    if (game.plys.length < 2 && yourTurn) {
      // Load Builder
      this.props.navigator.push({
        component: Builder,
        title: 'Create your army',
        passProps: { game: game },
      });
    } else {
      this.props.navigator.push({
        component: Board,
        title: 'Create your army',
        passProps: { game: game },
      });
    }
  },
  newGame: function() {
    GameCenterManager.newMatch();
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    return (
      <View style={styles.container}>
        <TouchableElement style={styles.button} onPress={this.newGame}>
          <Text>New Game</Text>
        </TouchableElement>
        <Text style={styles.button}>How to Play</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
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
    borderColor: 'black',
    marginBottom: 10
  }
});

module.exports = Home;

