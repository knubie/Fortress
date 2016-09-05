var React = require('react');
var ReactNative = require('react-native');
var Colors = require('../lib/colors');
var TitleBar = require('./TitleBar.js');

var {
  StyleSheet,
  Text,
  Dimensions,
  View,
  Image,
  ScrollView,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  Dimensions,
} = ReactNative;

var Credits = React.createClass({
  back: function() {
    this.props.navigator.pop();
  },
  render: function() {
    return (
      <View style={{
        flex: 1,
      }}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'Credits'}
          rightText={''}
        />
        <View style={{
          flex: 1,
          justifyContent: 'center',
        }}>
          <Text style={styles.header}>
            GAME DESIGN / GRAPHICS / PROGRAMMING
          </Text>
          <Text style={styles.body}>
            Matthew Steedman
          </Text>
          <Text style={styles.header}>
            PLAY TESTING / SPECIAL THANKS
          </Text>
          <Text style={styles.body}>
            Kim Nguyen
          </Text>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  header: {
    fontFamily: 'Source Code Pro',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555555',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  body: {
    fontSize: 21,
    color: Colors.foreground,
    marginBottom: 80,
    lineHeight: 32,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.foregroundBright,
  },
  container: {
  }
});

module.exports = Credits;
