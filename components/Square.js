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
  getInitialState: function() {
    return {
      backgroundColor: new Animated.Value(0),
      scale: new Animated.Value(1),
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.highlight) {
      this.state.scale.setValue(0.95);
      Animated.timing(                          // Base: spring, decay, timing
        this.state.scale,                 // Animate `bounceValue`
        {
          toValue: 1,
          duration: 250, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.out(Easing.ease),
        }
      ).start();
      Animated.timing(                          // Base: spring, decay, timing
        this.state.backgroundColor,                 // Animate `bounceValue`
        {
          toValue: 1,
          duration: 250, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.linear,
        }
      ).start();
    } else {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.backgroundColor,                 // Animate `bounceValue`
        {
          toValue: 0,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.linear,
        }
      ).start();
    }
  },
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
    var backgroundColor = this.state.backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(53, 53, 53, 1)', 'rgba(61,67,72,1)'],
    });

    var movedLastStyles = this.props.movedLast && !this.props.highlight ?
      {borderWidth: 2, borderColor: '#4A4A4A'} : null;

    return (
      <TouchableHighlight onPress={this.onClick}>
        <Animated.View
          style={[
            {transform: [{scale: this.state.scale}] },
            styles.square,
            movedLastStyles,
            {backgroundColor: backgroundColor}
        ]}>
          {this.props.children}
        </Animated.View>
      </TouchableHighlight>
    );
  }
});

var squareSize = Math.floor((Dimensions.get('window').width - (40 + ((7 - 1) * 2))) / 7);
var styles = StyleSheet.create({
  square: {
    width: squareSize,
    height: squareSize,
    borderRadius: 4,
    margin: 1,
  },
  white: { backgroundColor: '#953535' },
  black: { backgroundColor: '#359535' },
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
