var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');

var PieceDisplay = require('../lib/piece-display');

var {
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Image,
  Text,
  View,
  Platform,
  PropTypes,
  TouchableHighlight,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
} = React;

var Piece = React.createClass({
  propTypes: {
    onClick: PropTypes.func,
    piece: PropTypes.instanceOf(Types.Piece)
  },
  getInitialState: function() {
    //this._backgroundColor = new Animated.Value(0);
    //this._borderBottomColor = new Animated.Value(0);
    return {
      dragging: false,
      backgroundColor: new Animated.Value(0),
      borderBottomColor: new Animated.Value(0),
      x: 0,
      y: 0
    }
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.selected) {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.backgroundColor,                 // Animate `bounceValue`
        {
          toValue: 1,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.linear,
        }
      ).start();
      Animated.timing(                          // Base: spring, decay, timing
        this.state.borderBottomColor,                 // Animate `bounceValue`
        {
          toValue: 1,
          duration: 150, // milliseconds
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
      Animated.timing(                          // Base: spring, decay, timing
        this.state.borderBottomColor,                 // Animate `bounceValue`
        {
          toValue: 0,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.linear,
        }
      ).start();
    }
  },
  setPosition: function(e) {
    this.setState({
      drag: {
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY
      },
      x: this.state.x + (e.nativeEvent.pageX - this.state.drag.x),
      y: this.state.y + (e.nativeEvent.pageY - this.state.drag.y)
    });
  },
  resetPosition: function(e) {
    this.setState({
      dragging: false,
      x: 0,
      y: 0
    });
  },
  _onStartShouldSetResponder: function(e) {
    this.setState({
      dragging: true,
      drag: {
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY
      }
    });
    return true;
  },
  _onMoveShouldSetResponder: function(e) {
    return false;
  },
  getDragStyle: function() {
    var transform = [{translateX: this.state.x}, {translateY: this.state.y}];
    return {transform: transform};
  },
  onClick: function() {
    this.props.onClick(this.props.piece);
  },
  render: function() {
      //borderBottomColor: new Animated.Value('rgba(69, 69, 69, 100)'),
    var backgroundColor = this.state.backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(96, 96, 96, 100)', 'rgba(56, 117, 164, 1)'],
    });
    var borderBottomColor = this.state.backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(69, 69, 69, 100)', 'rgba(41, 85, 118, 1)'],
    });
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var type = null;
    if (R.contains('royal', this.props.piece.types)) {
      type = <Image style={styles.touchable} source={require('../assets/tile-royal.png')}/>;
    }
    var className = "piece";
    return (
      <TouchableWithoutFeedback onPress={this.onClick}>
        <Animated.View
          style={[
            styles.tile,
            {backgroundColor: backgroundColor,
              borderBottomColor: borderBottomColor},
          ]}
        >
          <Image source={PieceDisplay[this.props.piece.name].image[this.props.color || this.props.piece.color]}
            style={[this.getDragStyle(), styles.touchable]}
          >
            {type}
          </Image>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
});

var squareSize = Math.floor((Dimensions.get('window').width - (40 + ((7 - 1) * 2))) / 7);
var styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: squareSize,
    height: squareSize,
    borderRadius: 4,
    borderBottomWidth: 3,
  },
  black: {
    backgroundColor: '#606060',
    borderBottomColor: '#454545',
  },
  white: {
    backgroundColor: '#606060',
    borderBottomColor: '#454545',
  },
  touchable: {
    position: 'relative',
    top: 3,
    left: 3,
    width: squareSize - 6,
    height: squareSize - 6,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  piece: {
    fontSize: 34,
  },
  selected: {
    backgroundColor: '#3875A4',
    borderBottomColor: '#295576',
  },
});

module.exports = Piece;
