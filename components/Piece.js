var R = require('ramda');
var React = require('react-native');
var Types = require('../engine/Types');

var PieceDisplay = require('../lib/piece-display');

var {
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
    return {
      dragging: false,
      x: 0,
      y: 0
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
        <View style={[styles.tile, styles[this.props.piece.color]]}>
          <Image source={PieceDisplay[this.props.piece.name].image[this.props.color || this.props.piece.color]}
            style={[this.getDragStyle(), styles.touchable]}
          >
            {type}
          </Image>
        </View>
      </TouchableWithoutFeedback>
    );
  }
});

var squareSize = (Dimensions.get('window').width - (40 + ((7 - 1) * 2))) / 7;
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
    backgroundColor: '#C4C4C4',
    borderBottomColor: '#808080',
  },
  white: {
    backgroundColor: '#6D6D6D',
    borderBottomColor: '#484848',
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
  }
});

module.exports = Piece;
