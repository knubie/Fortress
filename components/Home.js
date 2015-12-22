var React = require('react-native');
var Builder = require('./Builder');
var MapView = require('./MapView');
var R = require('ramda');
//var Board = require('./Board');
//var Builder = require('./Builder');
var Types = require('../engine/Types');
var GameCenterManager = React.NativeModules.GameCenterManager;
var GameCenterViewController = React.NativeModules.GameCenterViewController;
var { NativeAppEventEmitter } = require('react-native');

var {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
} = React;

var Home = React.createClass({
  componentDidMount: function() {
    console.log('logging test');
    var subscription = NativeAppEventEmitter.addListener(
      'EventReminder',
      data => { console.log('foo'); console.log(data.match); }
    );
  },
  newGame: function() {
    GameCenterManager.addEvent('Birthday Party', '4 Privet Drive, Surrey');
    //this.props.navigator.push({
      //component: MapView,
      //title: 'Create your army',
      //passProps: { myProp: 'foo', style: styles.container },
    //});
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    return (
      <View style={styles.container}>
        <Text onPress={this.newGame}>New Game</Text>
        <Text>How to Play</Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = Home;

