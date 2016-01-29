var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');

var {
  TouchableWithoutFeedback,
  Dimensions,
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
    var borderStyle = styles.unselected;
    if (R.contains('royal', this.props.piece.types)) {
      borderStyle = styles.borderRoyal;
    }
    if (this.props.selected) {
      borderStyle = styles.selected;
    }
    var cardStyle = this.props.disabled ? [styles.card, styles.disabled] : styles.card;
    return (
      <TouchableWithoutFeedback onPress={this.onPress}>
        <View style={cardStyle}>
          <View style={[styles.cardBorder, borderStyle]}>
            <Image
              source={PieceDisplay[this.props.piece.name].image['black']}
              style={{backgroundColor: 'rgba(0,0,0,0)', width: 40, height: 40}}
            />
          </View>
          <View style={styles.points}>
            <Text style={styles.pointText}>{this.props.piece.points}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
});

var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;
var styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    marginRight: 10,
    shadowColor: '#000000',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  disabled: {
    opacity: 0.5,
  },
  cardBorder: {
    margin: 4,
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: '#D8D8D8',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#00BBFF',
  },
  unselected: {
    borderColor: '#979797',
  },
  borderRoyal: {
    borderColor: '#979797',
  },
  points: {
    position: 'absolute',
    top: 0,
    left: 10,
    backgroundColor: '#979797',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  pointText: {
    fontSize: 10,
    color: 'white',
    fontFamily: 'Helvetica Neue',
    fontWeight: '600',
  }
});

module.exports = PieceCard;
