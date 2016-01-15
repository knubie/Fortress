var R = require('ramda');
var React = require('react-native');

var {
  StyleSheet,
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
    this.props.onClick(this.props.x, this.props.y);
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var style = [styles[this.props.color], styles.square];
    if (this.props.selected) {
      style = R.append(styles.selected, style);
    }
    if (this.props.highlightLastMove) {
      style = R.append(styles.lastMove, style);
    }
    return (
      <TouchableElement
        style={style}
        onPress={this.onClick}
        onMoveShouldSetResponder={this._onMoveShouldSetResponder}
      >
        <View>{this.props.children}</View>
      </TouchableElement>
    );
  }
});

var styles = StyleSheet.create({
  square: { width: 46, height: 46 },
  white: { backgroundColor: 'white' },
  black: { backgroundColor: '#eee' },
  whiteHighlight: { backgroundColor: '#ccd' },
  blackHighlight: { backgroundColor: '#bbc' },
  lastMove: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'red'
  },
  selected: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'blue'
  }
});

module.exports = Square;
