var React = require('react');
var ReactNative = require('react-native');

var {
  Easing,
  Image,
  Animated,
  Dimensions,
  View,
  PropTypes,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} = ReactNative;

var CARD_WIDTH = 180;
var CARD_HEIGHT = 253;

var Confetti = React.createClass({
  PropTypes: {
    message: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      top: new Animated.Value(0),
      left: new Animated.Value(0),
      width: new Animated.Value(0),
      height: new Animated.Value(0),
      opacity: Math.random(),
    };
  },
  componentDidMount: function() {
    setTimeout(() => {
      this.startFalling();
      this.startSwinging();
      this.startFlipping();
    }, Math.floor(Math.random() * 10000));
  },
  startSwinging: function() {
    var start, end;
    var delta = Math.random() * (100 - 50) + 50
    // Pick a random number, 0 or 1, if 0, swing from right to left.
    if (Math.floor(Math.random() * 2) == 0) {
      start = this.state.left._value + delta; 
      end = this.state.left._value - delta; 
    // Otherwise swing left to right.
    } else {
      end = this.state.left._value + delta; 
      start = this.state.left._value - delta; 
    }
    Animated.timing(
      this.state.left,
      {
        toValue: start,
        duration: 3000,
        delay: 0,
        //easing: Easing.cubic(Easing.inOut),
      }
    ).start(() => {
      Animated.timing(
        this.state.left,
        {
          toValue: end,
          duration: 3000,
          delay: 0,
          //easing: Easing.cubic(Easing.inOut),
        }
      ).start(() => {
        this.startSwinging();
      });
    });
  },
  startFlipping: function() {
    var widthOrHeight;
    var originalValue;
    if (Math.floor(Math.random() * 2) == 0) {
      widthOrHeight = this.state.width
      originalValue = widthOrHeight._value;
    } else {
      widthOrHeight = this.state.height
      originalValue = widthOrHeight._value;
    }
    var originalWidth = this.state.width._value;
    Animated.timing(
      widthOrHeight,
      {
        toValue: 0,
        duration: 100,
        delay: 0,
        easing: Easing.linear,
      }
    ).start(() => {
      Animated.timing(
        widthOrHeight,
        {
          toValue: originalValue,
          duration: 100,
          delay: 0,
          easing: Easing.linear,
        }
      ).start(() => {
        this.startFlipping();
      });
    });
  },
  startFalling: function() {
    var dim = Math.floor(Math.random() * 7) + 4;
    this.state.top.setValue(0);
    this.state.left.setValue(Math.floor(Math.random() * Dimensions.get('window').width) - 50);
    this.state.width.setValue(dim);
    this.state.height.setValue(dim);
    this.setState({
      opacity: Math.random(),
    });
    Animated.timing(
      this.state.top,
      {
        toValue: Dimensions.get('window').height,
        duration: 10000,
        delay: 0,
        easing: Easing.linear,
      }
    ).start(() => {
      this.startFalling();
    });
  },
  render: function() {
    return (
      <Animated.View style={{
        position: 'absolute',
        top: this.state.top,
        left: this.state.left,
        width: this.state.width,
        height: this.state.height,
        backgroundColor: 'white',
        opacity: this.state.opacity,
      }}>
      </Animated.View>
    );
  }
});

module.exports = Confetti;
