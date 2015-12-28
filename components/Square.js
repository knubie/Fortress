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
    var style = this.props.selected ? [styles[this.props.color], styles.square, styles.selected] : [styles[this.props.color], styles.square];
    if (this.props.selected) {
      console.log('selected');
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
  selected: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'blue'
  }
});

module.exports = Square;
