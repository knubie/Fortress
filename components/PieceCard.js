var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');

var {
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
} = React;

var PieceCard = React.createClass({
  onPress: function() {
    this.props.onPress(this.props.piece);
  },
  render: function() {
    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <Image
          source={this.props.selected ?
                  require('../assets/card-selected.png') :
                  require('../assets/card-front.png')}
          style={styles.card}>
          <Image
            source={PieceDisplay[this.props.piece.name].image['black']}
            style={{backgroundColor: 'rgba(0,0,0,0)', width: 40, height: 40}}
          />
        </Image>
      </TouchableWithoutFeedback>
    );
  }
});

var styles = StyleSheet.create({
  card: {
    margin: 4,
    paddingTop: 13,
    paddingLeft: 3,
  },
});

module.exports = PieceCard;
