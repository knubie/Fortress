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
      <Text style={[styles.tag, styles[this.props.type]]}>{this.props.text}</Text>
    );
  }
});

var styles = StyleSheet.create({
  tag: {
    fontSize: 11,
    fontFamily: 'Helvetica Neue',
    letterSpacing: 1,
    fontWeight: 'bold',
    color: '#212121',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    marginLeft: 4,
  },
  royal: {
    backgroundColor: '#dab900',
  },
  ranged: {
    backgroundColor: '#D8D8D8',
  },
  invincible: {
    backgroundColor: '#666',
  },
  movement: {
    backgroundColor: '#6D6D6D',
    color: 'white',
    borderRadius: 7,
    fontSize: 10,
    height: 14,
  },
});

module.exports = Tag;
