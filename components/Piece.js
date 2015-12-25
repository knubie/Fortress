var React = require('react-native');
var Types = require('../engine/Types');
var PropTypes = React.PropTypes;

var {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
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
    var pieceLookup = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙',
        'nightrider': '🐴',
        'cannon': '🔫',
        'bloodlust': '💉',
        'bomber': 'b',
        'dabbaba': '🚌',
        'alfil': '🐘',
        'wazir': '👳',
        'ferz': '👷',
        'archbishop': '👺',
        'empress': '💁',
        'berolina': '🐜',
        'shapeshifter': '👻'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟',
        'nightrider': 'O',
        'cannon': 'I',
        'bloodlust': 'B'
      }
    }
    var className = "piece";
    return (
      <TouchableElement
        style={this.getDragStyle()}
        onPress={this.onClick}
        onStartShouldSetResponder={this._onStartShouldSetResponder}
        onMoveShouldSetResponder={this._onMoveShouldSetResponder}
        onResponderMove={this.setPosition}
        onResponderRelease={this.resetPosition}
      >
        <Text style={styles.piece}>
          {pieceLookup[this.props.piece.color][this.props.piece.name]}
        </Text>
      </TouchableElement>
    );
  }
});

var styles = StyleSheet.create({
  piece: {
    fontSize: 44,
  }
});

module.exports = Piece;
