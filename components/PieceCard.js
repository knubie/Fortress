var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');
var Types = require('../engine/Types');

var {
  Easing,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
} = React;

var cardWidth = (Dimensions.get('window').width - (40 + ((5 - 1) * 10))) / 5;
var cardHeight = cardWidth * 1.5;
var PieceCard = React.createClass({
  componentWillReceiveProps: function(nextProps) {
    // TODO: this should be replaced by something else.
    var piece = Types.Piece.of({
      name: nextProps.card,
      color: 'white',
      position: Types.Position.of({x: -1, y: -1}),
    });
    this.setState({
      points: piece.points,
    });
  },
  getInitialState: function() {
    // TODO this is clunky.
    // It also breaks because the keys are not unique.
    var piece = Types.Piece.of({
      name: this.props.card,
      color: 'white',
      position: Types.Position.of({x: -1, y: -1}),
    });
    return {
      translate: 0,
      points: piece.points,
      scale: new Animated.Value(1),
    }
  },
  onPress: function() {
    this.props.onPress(this.props.card, this.props.index);
  },
  onPressIn: function() {
    Animated.timing(                          // Base: spring, decay, timing
      this.state.scale,                 // Animate `bounceValue`
      {
        toValue: 1.1,
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.out(Easing.ease),
      }
    ).start();
  },
  onPressOut: function() {
    Animated.timing(                          // Base: spring, decay, timing
      this.state.scale,                 // Animate `bounceValue`
      {
        toValue: 1,
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.out(Easing.ease),
      }
    ).start();
  },
  render: function() {
    var borderStyle = styles.unselected;
    //if (R.contains('royal', this.props.piece.types)) {
      //borderStyle = styles.borderRoyal;
    //}
    if (this.props.selected) {
      borderStyle = styles.selected;
    }
    var cardStyle = this.props.disabled ? [styles.card, styles.disabled] : styles.card;
    return (
      <TouchableWithoutFeedback
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        onPress={this.onPress}>
        <Animated.View style={[cardStyle, {transform: [{scale: this.state.scale}] }]}>
          <View style={[styles.cardBorder, borderStyle]}>
            <Image
              source={PieceDisplay[this.props.card].image['black']}
              style={{backgroundColor: 'rgba(0,0,0,0)', width: cardWidth - 10, height: cardWidth - 10}}
            />
          </View>
          <View style={styles.points}>
            <Text style={styles.pointText}>{this.state.points}</Text>
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
});

// cardWidth - 10

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
