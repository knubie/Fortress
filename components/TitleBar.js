var R = require('ramda');
var React = require('react');
var Colors = require('../lib/colors');
var ReactNative = require('react-native');

var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  TouchableNativeFeedback,
} = ReactNative;

var TitleBar = React.createClass({
  render: function() {
    return (
      <View style={styles.titleContainer}>
        <Text onPress={this.props.onLeftPress} style={styles.navigation}>
          {this.props.leftText}
        </Text>
        <Text onPress={this.props.onCenterPress} style={styles.turnMessage}>
          {this.props.centerText}
        </Text>
        <Text onPress={this.props.onRightPress} style={styles.turnMessage}>
          {this.props.rightText}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  titleContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnMessage: {
    color: Colors.foreground,
    fontWeight: '600',
    fontSize: 14,
  },
  navigation: {
    fontFamily: 'Anonymous Pro',
    fontSize: 45,
    color: Colors.foreground,
    backgroundColor: 'rgba(0,0,0,0)',
    fontWeight: 'bold',
  },
});

module.exports = TitleBar;
