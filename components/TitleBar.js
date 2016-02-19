var R = require('ramda');
var React = require('react-native');

var {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  TouchableNativeFeedback,
} = React;

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
    marginHorizontal: 20,
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  turnMessage: {
    color: '#c4c4c4',
    fontWeight: '600',
    fontSize: 14,
  },
  navigation: {
    fontFamily: 'Anonymous Pro',
    fontSize: 45,
    color: '#c4c4c4',
    fontWeight: 'bold',
  },
});

module.exports = TitleBar;
