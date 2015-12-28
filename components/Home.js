var React = require('react-native');
var R = require('ramda');
var PlayView = require('./PlayView');
var Builder = require('./Builder');
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
  // TODO: keep an eye on API changes.
  builderRef: function(builderRef) {
    this._builderRef = builderRef;
  },
  loadMatch: function(game) {
    console.log(game);
    if (game.plys.length < 2 && yourTurn) {
      // Load Builder
      this.props.navigator.push({
        component: Builder,
        title: 'Create your army',
        rightButtonTitle: 'Next',
        onRightButtonPress: () => {
          // TODO: keep an eye on API changes.
          this._builderRef && this._builderRef.next();
        },
        passProps: ({ game, ref: this.builderRef }),
      });
    } else {
      this.props.navigator.push({
        component: PlayView,
        title: 'Play the game',
        passProps: ({ game, yourTurn }),
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

