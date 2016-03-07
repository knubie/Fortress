var R = require('ramda');
var React = require('react-native');
var PieceDisplay = require('../lib/piece-display');
var Types = require('../engine/Types');
var Cards = require('../engine/Cards');
var Pieces = require('../engine/Pieces');

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
  shouldComponentUpdate: function(nextProps, nextState) {
    return R.not(R.and(R.equals(nextProps, this.props),
            R.equals(nextState, this.state)))
  },
  propTypes: {
    card: React.PropTypes.string.isRequired,
  },
  componentWillUpdate: function(nextProps) {
    if (nextProps.left !== this.state.left._value) {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.left,                 // Animate `bounceValue`
        {
          toValue: nextProps.left,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.out(Easing.ease),
        }
      ).start();
    }
    if (nextProps.hover && nextProps.hover !== this.props.hover) {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.scale,                 // Animate `bounceValue`
        {
          toValue: 1.2,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.out(Easing.ease),
        }
      ).start();
    } else if (!nextProps.hover && nextProps.hover !== this.props.hover) {
      Animated.timing(                          // Base: spring, decay, timing
        this.state.scale,                 // Animate `bounceValue`
        {
          toValue: 1,
          duration: 150, // milliseconds
          delay: 0, // milliseconds
          easing: Easing.out(Easing.ease),
        }
      ).start();
    }
  },
  getInitialState: function() {
    return {
      translate: 0,
      scale: new Animated.Value(1),
      left: new Animated.Value(this.props.left || 0),
    }
  },
  onPress: function() {
    //this.props.onPress(this.props.card, this.props.index);
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
  onStartShouldSetResponder: function(e, gestureState) {
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;
    this.isDragging = false;
    this.isScrolling = false;
    this.startDragTime = e.nativeEvent.timestamp;
    // TODO: eventually take this exist check out
    if (this.props.onStartShouldSetResponder != null) {
      this.props.onStartShouldSetResponder(e, this.props.card);
    }
    return true;
  },
  onResponderGrant: function(e, gestureState) {
      //this.props.onResponderGrant(e, this.props.card);
    //this.longpressTimer = setTimeout(() => {
      //this.props.onResponderGrant(e, this.props.card);
      ////this.onPressIn();
    //}, 100);
    //this.props.onResponderGrant(e);
  },
  onResponderReject: function(e) {
    this.isDragging = false;
  },
  onResponderMove: function(e, gestureState) {
    var dx = Math.abs(this.startDragX - e.nativeEvent.pageX);
    var dy = Math.abs(this.startDragY - e.nativeEvent.pageY);
    if (dy > 60 && !this.isDragging) {

    //if (dx > dy && !this.isScrolling && !this.isDragging) {
      //this.isScrolling = true;
    //} else if (dx < dy && !this.isScrolling && !this.isDragging) {
      this.isDragging = true;
      // TODO: eventually take this exist check out
      if (this.props.onResponderGrant != null) {
        this.props.onResponderGrant(e, this.props.card, this.props.index);
      }
    }
    if (dx > 5) {
      this.isScrolling = true;
    }
    if (this.isDragging) {
      // TODO: eventually take this exist check out
      if (this.props.onResponderMove != null) {
        this.props.onResponderMove(e, this.props.card);
      }
    }
  },
  onResponderRelease: function(e, gestureState) {
    if (!this.isDragging && !this.isScrolling && this.props.onPress != null) {
      this.props.onPress(this.props.card, this.props.index);
    }
    this.isDragging = false;
    this.isScrolling = false;
    if (this.props.onResponderRelease != null) {
      this.props.onResponderRelease(e, this.props.card);
    }
  },
  onResponderTerminationRequest: function(e) {
    return false;
  },
  onResponderTerminate: function(e) {
    //this.isDragging = false;
  },
  render: function() {
    var borderStyle = styles.unselected;
    //if (R.contains('royal', this.props.piece.types)) {
      //borderStyle = styles.borderRoyal;
    //}
    if (this.props.selected) {
      borderStyle = styles.selected;
    }
    var isAction = Pieces[this.props.card] == null;
    var cardType = isAction ? styles.cardAction : styles.cardPiece;
    var cardStyle = this.props.disabled ? [styles.card, styles.disabled] : styles.card;
    return (
      <Animated.View
        style={[{
          position: 'absolute',
          top: 0,
          left: this.state.left || 0,
          backgroundColor: 'rgba(0,0,0,0)',
        }, this.props.style]}
        //onPressIn={this.onPressIn}
        //onPressOut={this.onPressOut}
        //onPress={this.onPress}
      >
        <Animated.View
          style={[
            cardStyle,
            cardType,
            borderStyle,
            {
              opacity: this.props.invisible ? 0 : 1,
              transform: [{scale: this.state.scale}],
              //backgroundColor: R.contains('royal', R.path([this.props.card, 'types'], Pieces) || []) ? '#DAB900' : '#D8D8D8',
            }
        ]}>
          <Image
            source={isAction ? PieceDisplay[this.props.card].image['black'] : PieceDisplay[this.props.card].image['white']}
            style={{backgroundColor: 'rgba(0,0,0,0)', width: cardWidth - 10, height: cardWidth - 10}}
          />
          <View style={[styles.points,]}>
            <Text style={styles.pointText}>{Cards[this.props.card].points}</Text>
          </View>
        </Animated.View>
        <View
          style={styles.gestureOverlay}
          onStartShouldSetResponder={this.onStartShouldSetResponder}
          onResponderGrant={this.onResponderGrant}
          onResponderReject={this.onResponderReject}
          onResponderMove={this.onResponderMove}
          onResponderRelease={this.onResponderRelease}
          onResponderTerminationRequest={this.onResponderTerminationRequest}
          onResponderTerminate={this.onResponderTerminate}
        ></View>
      </Animated.View>
    );
  }
});

// cardWidth - 10

var cardMarginRight = 10;
var styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardHeight,
    marginTop: 2,
    borderRadius: 4,
    backgroundColor: '#D8D8D8',
    borderWidth: 1,
    borderColor: '#D8D8D8',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 0,
    shadowOffset: {
      width: 3,
      height: 3,
    },
  },
  cardPiece: {
    backgroundColor: '#353535',
    borderColor: '#353535',
  },
  cardAction: {
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    borderWidth: 1,
    borderColor: '#00BBFF',
    //shadowColor: '#00BBFF',
    //shadowOpacity: 1,
    //shadowRadius: 2,
    //shadowOffset: {
      //width: 0,
      //height: 0,
    //},
  },
  unselected: {
    //borderColor: '#979797',
  },
  borderRoyal: {
    //borderColor: '#979797',
  },
  points: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DAB900',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 0,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  pointText: {
    fontSize: 10,
    color: '#645500',
    fontFamily: 'Helvetica Neue',
    fontWeight: '700',
  },
  gestureOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255, 0, 0, 0)',
  },
});

module.exports = PieceCard;
