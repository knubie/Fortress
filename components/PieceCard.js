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
      <View style={styles.container}>
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
        <Image style={styles.points} source={require('../assets/point-circle.png')}>
          <Text style={styles.pointText}>{this.props.piece.points}</Text>
        </Image>
      </View>
      </TouchableWithoutFeedback>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  card: {
    paddingTop: 13,
    paddingLeft: 2,
  },
  points: {
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    top: -6,
    left: -6,
  },
  pointText: {
    color: '#c4c4c4',
    fontSize: 18,
    fontFamily: 'superscript',
    position: 'absolute',
    top: 1.5,
    left: 5,
  }
});

module.exports = PieceCard;
