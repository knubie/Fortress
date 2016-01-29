var R = require('ramda');
var React = require('react-native');

var {
  StyleSheet,
  Dimensions,
  Image,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
} = React;

var Square = React.createClass({
  _onMoveShouldSetResponder: function(e) {
    console.log('i\'m being highlighted!');
    return true;
  },
  onClick: function() {
    console.log('click square');
    this.props.onClick(this.props.x, this.props.y);
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var source = require('../assets/tile.png');
    var highlightStyle = null;
    if (this.props.highlightLastMove) {
      source = require('../assets/tile-last-move.png');
    }
    if (this.props.selected) {
      highlightStyle = styles.selected;
    }
    if (this.props.highlight) {
      highlightStyle = styles.highlighted;
    }
    if (this.props.capture) {
      highlightStyle = styles.capture;
    }
    var style = [styles[this.props.color], styles.square];
    if (this.props.selected) {
      style = R.append(styles.selected, style);
    }
    if (this.props.highlightLastMove) {
      style = R.append(styles.lastMove, style);
    }
    return (
      <TouchableHighlight onPress={this.onClick}>
        <View source={source}
          style={style}
        >
          <View style={[styles.square, highlightStyle]}>
            {this.props.children}
          </View>
        </View>
      </TouchableHighlight>
    );
  }
});

var squareSize = (Dimensions.get('window').width - (40 + ((8 - 1) * 2))) / 8;
var styles = StyleSheet.create({
  square: {
    width: squareSize,
    height: squareSize,
    borderRadius: 2,
    marginBottom: 2,
  },
  white: { backgroundColor: '#7C7C7C' },
  black: { backgroundColor: '#646464' },
  highlighted: {
    backgroundColor: 'rgba(128,204,255,0.2)',
  },
  selected: {
    backgroundColor: '#215888',
  },
  capture: {
    backgroundColor: 'rgba(240,52,52,0.25)',
  },
  whiteHighlight: { backgroundColor: '#5C8B9C' },
  blackHighlight: { backgroundColor: '#55717B' },
  lastMove: {
    borderColor: 'white',
    borderWidth: 2,
  },
});

module.exports = Square;
