var React = require('react-native');

var {
  PropTypes,
  StyleSheet,
  Text,
} = React;

var Tag = React.createClass({
  PropTypes: {
    type: React.PropTypes.string.isRequired
  },
  render: function() {
    return (
      <Text style={[styles.tag, styles[this.props.type]]}>{this.props.type.toUpperCase()}</Text>
    );
  }
});

var styles = StyleSheet.create({
  tag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#212121',
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  royal: {
    backgroundColor: '#dab900',
  },
  ranged: {
  },
  invincible: {
  }
});

module.exports = Tag;
