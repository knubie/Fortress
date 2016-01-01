var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');

var {
  StyleSheet,
  Text,
  View,
} = React;

var PieceCard = React.createClass({
  movementText: function(parlett) {
    return R.reduce((first, second) => {
      var head = first === '' ? '' : ', ';
      return first + head + second.distance + '(' + second.movement + ')';
    }, '', parlett);
  },
  render: function() {
    return !this.props.piece ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <Text style={styles.pieceDisplayPicture}>
          {PieceDisplay[this.props.piece.name].image[this.props.piece.color]}
        </Text>
        <Text style={styles.name}>{PieceDisplay[this.props.piece.name].displayName}</Text>
        <Text>{this.props.piece.royal ? '✨Royal✨' : ''}</Text>
        <Text style={styles.description}>
          {PieceDisplay[this.props.piece.name].description}
        </Text>
        <Text>Movement: {this.movementText(this.props.piece.parlett)}</Text>
        <Text>
          Points: {this.props.piece.points}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  name: {
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    color: '#999'
  },
  pieceDisplayContainer: {
    padding: 20
  },
  pieceDisplayPicture: {
    fontSize: 80
  }
});

module.exports = PieceCard;
