var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');
var Pieces = require('../engine/Pieces');

var {
  StyleSheet,
  Text,
  View,
} = React;

var PieceCard = React.createClass({
  render: function() {
    console.log(PieceDisplay);
    return !this.props.piece ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <Text style={styles.pieceDisplayPicture}>
          {PieceDisplay.picture[this.props.piece.color][this.props.piece.name]}
        </Text>
        <Text>Name: {this.props.piece.name}</Text>
        <Text>
          Points: {Pieces[this.props.piece.name].points}
        </Text>
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
