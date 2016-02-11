var R = require('ramda');
var React = require('react-native');

var {
  Easing,
  Animated,
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
    var highlightStyle = null;
    if (this.props.highlightLastMove) {
      highlightStyle = styles.lastMove;
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
    return (
      <TouchableHighlight onPress={this.onClick}>
        <View style={style}>
          <Animated.View style={[styles.square, highlightStyle]}>
            {this.props.children}
          </Animated.View>
        </View>
      </TouchableHighlight>
    );
  }
});

var squareSize = (Dimensions.get('window').width - (40 + ((7 - 1) * 2))) / 7;
var styles = StyleSheet.create({
  square: {
    width: squareSize,
    height: squareSize,
    borderRadius: 4,
    marginBottom: 2,
  },
  white: { backgroundColor: '#353535' },
  black: { backgroundColor: '#353535' },
  highlighted: {
    backgroundColor: 'rgba(128,204,255,0.1)',
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
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
  },
});

module.exports = Square;
