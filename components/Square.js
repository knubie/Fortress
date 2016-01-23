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
    if (this.props.highlightLastMove) {
      var source = require('../assets/tile-last-move.png');
    }
    if (this.props.selected) {
      var source = require('../assets/tile-selected.png');
    }
    // TODO rewrite this.
    if (this.props.color === 'whiteHighlight' || this.props.color === 'blackHighlight') {
      var source = require('../assets/tile-move.png');
    }
    // TODO rewrite this.
    if (this.props.color === 'Capture') {
      var source = require('../assets/tile-attack.png');
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
        <Image source={source}
          style={style}
        >
          {this.props.children}
        </Image>
      </TouchableHighlight>
    );
  }
});

var squareSize = (Dimensions.get('window').width - 14) / 8
var styles = StyleSheet.create({
  square: { width: squareSize, height: squareSize },
  white: { backgroundColor: 'white' },
  black: { backgroundColor: '#eee' },
  whiteHighlight: { backgroundColor: '#ccd' },
  blackHighlight: { backgroundColor: '#bbc' },
  lastMove: {
  },
  selected: {
  }
});

module.exports = Square;
