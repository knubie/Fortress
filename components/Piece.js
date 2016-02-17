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
  changeColor: function(color) {
    var val = {
      'default selected': 0,
      'selected': 1,
      'default attacked': 2,
      'attacked': 3,
    }
    Animated.timing(                          // Base: spring, decay, timing
      this.state.backgroundColor,                 // Animate `bounceValue`
      {
        toValue: val[color],
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.linear,
      }
    ).start();
    Animated.timing(                          // Base: spring, decay, timing
      this.state.borderBottomColor,                 // Animate `bounceValue`
      {
        toValue: val[color],
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.linear,
      }
    ).start();
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.selected) {
      this.changeColor('selected');
    } else if (nextProps.attacked) {
      this.changeColor('attacked');
    } else if (!nextProps.selected && this.state.backgroundColor._value === 1) {
      this.changeColor('default selected');
    } else if (!nextProps.attacked && this.state.backgroundColor._value === 3) {
      this.changeColor('default selected');
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
      inputRange: [
        0, // default
        1, // blue
        2, // default
        3, // red
      ],
      outputRange: [
        'rgba(96, 96, 96, 1)',
        'rgba(56, 117, 164, 1)',
        'rgba(96, 96, 96, 1)',
        'rgba(201, 40, 51, 1)',
      ],
    });
    var borderBottomColor = this.state.backgroundColor.interpolate({
      inputRange: [
        0,
        1,
        2,
        3,
      ],
      outputRange: [
        'rgba(69, 69, 69, 1)',
        'rgba(41, 85, 118, 1)',
        'rgba(69, 69, 69, 1)',
        'rgba(114, 30, 52, 1)',
      ],
    });
    var movedLastStyles = this.props.movedLast &&
                          !this.props.selected &&
                          !this.props.attacked ?
      {borderWidth: 2, borderColor: '#A1A1A1'} : null;
    var TouchableElement = TouchableHighlight;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    var type = null;
    if (R.contains('royal', this.props.piece.types)) {
      type = <Image style={styles.touchable} source={require('../assets/tile-royal.png')}/>;
    }
    return (
      <TouchableWithoutFeedback
        style={{
          position: 'absolute',
          top: 0, left: 0,
        }}
        onPress={this.onClick}
      >
        <Animated.View
          style={[
            styles.tile,
            movedLastStyles,
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
