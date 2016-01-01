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
    console.log(PieceDisplay);
    return !this.props.piece ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <Text style={styles.pieceDisplayPicture}>
          {PieceDisplay.picture[this.props.piece.color][this.props.piece.name]}
        </Text>
        <Text>Name: {this.props.piece.name}</Text>
        <Text>{this.props.piece.royal ? '✨Royal✨' : ''}</Text>
        <Text>
          Points: {this.props.piece.points}
        </Text>
        <Text>Movement: {this.movementText(this.props.piece.parlett)}</Text>
        <Text>
          {PieceDisplay.description[this.props.piece.name]}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  pieceDisplayContainer: {
    padding: 20
  },
  pieceDisplayPicture: {
    fontSize: 80
  }
});

module.exports = PieceCard;
