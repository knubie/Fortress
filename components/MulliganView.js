var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var CardModal = require('./CardModal');
var TitleBar = require('./TitleBar.js');
var PlayView = require('./PlayView');
var Chess = require('../engine/Main');
var Util = require('../engine/Util');
var GameCenter = require('../back-ends/game-center')

var {
  Dimensions,
  StyleSheet,
  Text,
  View,
} = ReactNative;

var MulliganView = React.createClass({
  getInitialState: function() {
    return {
      // The current game state.
      game: this.props.game,
      playerColor: this.props.game.turn,
      mulliganedCards: [],
    }
  },
  componentDidMount: function() {
  },
  onMulligan: function(card) {
    if (R.contains(card, this.state.mulliganedCards)) {
      this.setState({
        mulliganedCards: R.reject(R.equals(card), this.state.mulliganedCards),
      });
    } else {
      this.setState({
        mulliganedCards: R.append(card, this.state.mulliganedCards),
      });
    }
  },
  back: function() {
    this.props.navigator.pop();
  },
  next: function() {
    var game = Chess.mulliganPly(
      this.state.mulliganedCards,
      this.state.game);
    GameCenter.endTurnWithGame(game);
    //this.props.navigator.replace({
      //component: MulliganView,
      //title: 'Swap your hand',
      //// TODO: add names
      //passProps: ({ game, baseGame: game, yourTurn: true }),
    //});
    this.props.navigator.replace({
      component: PlayView,
      title: 'Play the game',
      // TODO: add names
      passProps: ({ game, baseGame: game, yourTurn: false }),
    });
  },
  render: function() {
    return (
      <View>
        <CardModal
          onDismiss={() => { this.setState({inspectedCard: null}); }}
          hidden={false}
          mulligan={true}
          onUse={() => { return null; }}
          scrollOffset={0}
          onMulligan={this.onMulligan}
          cards={this.state.game.hands[Util.colorToIndex(this.state.playerColor)]}
        ></CardModal>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'Mulligan'}
          rightText={'Next'}
        />
      </View>
    );
  },
});

module.exports = MulliganView;
