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
    //this._shadowColor = new Animated.Value(0);
    return {
      dragging: false,
      backgroundColor: new Animated.Value(0),
      shadowColor: new Animated.Value(0),
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
      this.state.shadowColor,                 // Animate `bounceValue`
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
      this.state.backgroundColor.setValue(0);
      this.changeColor('selected');
    } else if (nextProps.attacked) {
      this.state.backgroundColor.setValue(2);
      this.changeColor('attacked');
    } else if (!nextProps.selected && this.state.backgroundColor._value === 1) {
      this.changeColor('default selected');
    } else if (!nextProps.attacked && this.state.backgroundColor._value === 3) {
      this.changeColor('default attacked');
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
      //shadowColor: new Animated.Value('rgba(69, 69, 69, 100)'),
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
        'rgba(158, 0, 9, 1)',
      ],
    });
    var shadowColor = this.state.backgroundColor.interpolate({
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
        'rgba(100, 0, 6, 1)',
      ],
    });
    var movedLastStyles = this.props.movedLast &&
                          !this.props.selected &&
                          !this.props.attacked ?
      {borderWidth: 2, borderColor: '#7F7F7F'} : null;
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
            {backgroundColor: backgroundColor,
              shadowColor: shadowColor},
          ]}
        >
          <View style={[movedLastStyles, {borderRadius: 4, width: squareSize, height: squareSize - 3, position: 'absolute', top: 0, left: 0}]}/>
          <Image source={PieceDisplay[this.props.piece.name].image[this.props.color || this.props.piece.color]}
            style={[
              this.getDragStyle(),
              styles.touchable,
              {
                opacity: this.props.piece.asleep ? 0.5 : 1
              }
            ]}
          >
            {type}
          </Image>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
});

var boardSize = 6;
var squareSize = Math.floor((Dimensions.get('window').width - (40 + ((boardSize - 1) * 2))) / boardSize);
var styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: squareSize,
    height: squareSize - 3,
    borderRadius: 4,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },
  black: {
    backgroundColor: '#606060',
    shadowColor: '#454545',
  },
  white: {
    backgroundColor: '#606060',
    shadowColor: '#454545',
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
    shadowColor: '#295576',
  },
});

module.exports = Piece;
