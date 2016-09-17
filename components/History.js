var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var Chess = require('../engine/Main');
var Util = require('../engine/Util');
var Types = require('../engine/Types');
var PieceDisplay = require('../lib/piece-display');
var Modal = require('./Modal');
var CardIcon = require('./icons/Card');
var TitleBar = require('./TitleBar.js');
var Colors = require('../lib/colors');

var GameCenter = require('../back-ends/game-center')

var {
  Dimensions,
  ScrollView,
  StyleSheet,
  AlertIOS,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  ScrollView,
  NativeAppEventEmitter,
  Image,
} = ReactNative;

var History = React.createClass({
  propTypes: {
    plys: React.PropTypes.array.isRequired,
    baseGame: React.PropTypes.object.isRequired,
    currentPlayer: React.PropTypes.string.isRequired,
  },
  getInitialState: function() {
    this.messageList = [];
    R.reduce((gameList, ply) => {
      var prevGame = R.last(gameList);
      var nextGame = Chess.makePly(prevGame, ply);

      var yourTurnMessage = null;
      var theirName = this.props.currentPlayer === prevGame.turn ? 'You' : this.props.theirName;

      var textStyle = {
        backgroundColor: '#353535',
        paddingVertical: 5,
        paddingHorizontal: 8,
        borderRadius: 12,
      };
      
      switch(ply.type) {
        case 'DrawPly':
          yourTurnMessage = (
            <Text style={[{fontSize: 12, color: '#D8D8D8',}]}>
              <Text style={{fontWeight: 'bold',}}>{theirName}</Text> drew <CardIcon number={'1'}/> card!
            </Text>
          );
          break;

        case 'AbilityPly':
          var piece = ply.piece;
          var abilityName = PieceDisplay[piece.name]['ability'];
          yourTurnMessage = (
            <Text style={[textStyle, {fontSize: 12, color: '#D8D8D8',}]}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> used the ability <Text style={{fontWeight: 'bold'}}>{abilityName}</Text>.
            </Text>
          );
          break;

        case 'UseCardPly':
          var card = ply.card;
          var cardName = prevGame.hands[Util.colorToIndex(prevGame.turn)][card];
          yourTurnMessage = (
            <Text
              onPress={() => {
                this.setState({card: cardName});
              }}
              style={[textStyle, {fontSize: 12, color: '#D8D8D8',}]}
            >
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> played the <Text style={{fontWeight: 'bold'}}>{cardName}</Text> card.
            </Text>);
          break;

        case 'MovePly':
          var movedPiece = ply.piece;
          yourTurnMessage = (
            <Text style={[textStyle, {fontSize: 12, color: '#D8D8D8',}]}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> moved a piece.
            </Text>
          );
          break;
      }

      if (ply === 'draft') {
        if (prevGame.plys.length === 0) {
          yourTurnMessage = (
            <Text style={[textStyle, {fontSize: 12, color: '#D8D8D8',}]}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> started a new <Text style={{fontWeight: 'bold'}}>match</Text>.
            </Text>
          );
        } else if (prevGame.plys.length === 2) {
          yourTurnMessage = (
            <Text style={[textStyle, {fontSize: 12, color: '#D8D8D8',}]}>
              <Text style={{fontWeight: 'bold'}}>{theirName}</Text> joined the <Text style={{fontWeight: 'bold'}}>match</Text>.
            </Text>
          );
        }
      }

      var styles = theirName === 'You' ? {
        marginRight: 20,
        justifyContent: 'flex-end',
      } : {
        marginLeft: 20,
        justifyContent: 'flex-start',
      };

      this.messageList = R.append((
        <View style={[{
          marginVertical: 5,
          flexWrap: 'wrap',
          flexDirection: 'row',
          backgroundColor: 'transparent',
        }, styles]}>{yourTurnMessage}</View>
      ), this.messageList);

      return R.append(nextGame, gameList);
    }, [this.props.baseGame], this.props.plys);
    return {
      card: null,
    };
  },
  back: function() {
    this.props.navigator.pop();
  },
  clearCard: function() {
    this.setState({
      card: null,
    });
  },
  render: function() {
    var message;
    if (this.state.card) {
      message = (<Modal
        onPress={this.clearCard}
        card={this.state.card}
      >
      </Modal>);
    }
    return (
      <View style={styles.container}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={() => { return; }}
          leftText={'‹'}
          centerText={'History'}
          rightText={''}
        />
        <ScrollView style={styles.ScrollView}>
          {R.reverse(this.messageList)}
        </ScrollView>
        {message}
      </View>
    );
  },
});
var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

module.exports = History;
