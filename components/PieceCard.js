var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
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
} = ReactNative;

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
  onStartShouldSetResponder: function(e, gestureState) {
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;
    this.isDragging = false;
    this.isScrolling = false;
    this.granted = false;
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

      // TODO: eventually take this exist check out
      // We must first call onResponderGrant to disable scrolling,
      // then once scrolling is disabled we call it again to position the
      // dragged card. This is required, otherwise the scroll position would
      // continue into the subsequent frame, and the initial position of the
      // dragged card would appear off.
      if (this.props.onResponderGrant != null) {
        this.props.onResponderGrant(e, this.props.card, this.props.index, this.granted);
      }
      if (!this.granted) {
        this.granted = true;
      } else {
        this.isDragging = true;
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
    var borderType = isAction ? styles.cardBorderAction : styles.cardBorder;
    var cardStyle = this.props.disabled ? [styles.card, styles.disabled] : styles.card;
    var count = this.props.count != null ? (
      <View style={styles.count}>
        <Text style={styles.countLabel}>x{this.props.count}</Text>
      </View>
    ) : null;

    return (
      <Animated.View
        style={[{
          position: 'absolute',
          height: cardHeight,
          width: cardWidth,
          top: 0,
          left: this.state.left || 0,
          backgroundColor: 'rgba(0,0,0,0)',
        }, this.props.style]}
        //onPressIn={this.onPressIn}
        //onPressOut={this.onPressOut}
        onPress={this.onPress}
      >
        <Animated.View
          style={[
            cardStyle,
            cardType,
            borderStyle,
            {
              opacity: this.props.invisible ? 0 : (this.props.count === 0 ? 0.2 : 1),
              transform: [{scale: this.state.scale}],
              //backgroundColor: R.contains('royal', R.path([this.props.card, 'types'], Pieces) || []) ? '#DAB900' : '#D8D8D8',
            }
        ]}>
          <View style={borderType}>
            <Image
              source={PieceDisplay[this.props.card].image['white']}
              style={{backgroundColor: 'rgba(0,0,0,0)', width: cardWidth - 10, height: cardWidth - 10}}
            />
            <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', marginTop: 4,}}>
              <View style={styles.goldLabel}/>
              <Text style={styles.pointTextDark}>{Cards[this.props.card].points}</Text>
            </View>
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
        {count}
      </Animated.View>
    );
  }
});

// cardWidth - 10

var cardMarginRight = 10;
var styles = StyleSheet.create({
  count: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 7,
    width: cardWidth,
  },
  countLabel: {
    color: '#606060',
    fontSize: 11,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    borderRadius: 4,
    alignSelf: 'center',
    fontWeight: '600',
    fontFamily: 'Source Code Pro',
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    marginTop: 2,
    borderRadius: 4,
    backgroundColor: '#C4C4C4',
    borderWidth: 1,
    borderColor: '#C4C4C4',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  cardPiece: {
    backgroundColor: '#353535',
    borderColor: '#353535',
  },
  cardBorder: {
    backgroundColor: '#353535',
    borderColor: '#353535',
    borderWidth: 1,
    borderRadius: 4,
    width: cardWidth - 8,
    height: cardHeight - 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBorderAction: {
    backgroundColor: '#353535',
    borderColor: 'rgba(255,255,255,.15)',
    borderWidth: 1,
    borderRadius: 4,
    width: cardWidth - 8,
    height: cardHeight - 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAction: {
    backgroundColor: '#353535',
    borderColor: '#353535',
  },
  disabled: {
    opacity: 0.5,
  },
  selected: {
    borderWidth: 1,
    borderColor: '#007099',
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
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    justifyContent: 'center',
    marginTop: 5,
  },
  pointsDark: {
    backgroundColor: '#212121',
  },
  pointsLight: {
    backgroundColor: '#A6A6A6',
  },
  goldLabel: {
    marginRight: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DAB900',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  pointTextLight: {
    color: '#555555',
    fontSize: 10,
    fontFamily: 'Helvetica Neue',
    fontWeight: '700',
  },
  pointTextDark: {
    color: '#777777',
    fontSize: 10,
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
