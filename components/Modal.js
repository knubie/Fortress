var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var Pieces = require('../engine/Pieces');
var PieceInfo = require('./PieceInfo.js');
var Confetti = require('./Confetti.js');
var PieceDisplay = require('../lib/piece-display');

var {
  Easing,
  Image,
  Animated,
  Dimensions,
  View,
  PropTypes,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} = ReactNative;
var {
  PropTypes,
} = React;

var CARD_WIDTH = 180;
var CARD_HEIGHT = 253;

var Modal = React.createClass({
  PropTypes: {
    message: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      backgroundOpacity: new Animated.Value(0),
      cardOpacity: new Animated.Value(0),
      messageTop: new Animated.Value(0),
      boxTop: new Animated.Value(0),
      draggedCardX: new Animated.Value(0),
      draggedCardY: new Animated.Value(0),
    };
  },
  componentDidMount: function() {
    // BackgroundOpacity
    Animated.timing(
      this.state.backgroundOpacity,
      {
        toValue: 0.8,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
    this.state.cardOpacity.setValue(0);
    Animated.timing(
      this.state.cardOpacity,
      {
        toValue: 1,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
    // Message top
    this.state.messageTop.setValue(-25);
    Animated.timing(
      this.state.messageTop,
      {
        toValue: 0,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
    // Card top
    this.state.boxTop.setValue(100);
    Animated.timing(                          // Base: spring, decay, timing
      this.state.boxTop,                 // Animate `bounceValue`
      {
        toValue: 0,
        //friction: 7,
        //tension: 50,
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.out(Easing.ease),
      }
    ).start();
  },
  // Dismiss.
  onPress: function(direction) {
    // Animate background
    Animated.timing(
      this.state.backgroundOpacity,
      {
        toValue: 0,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
    Animated.timing(
      this.state.cardOpacity,
      {
        toValue: 0,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
    // Animate card swiping off the screen
    if (direction === 'right') {
      Animated.timing(
        this.state.draggedCardX,
        {
          toValue: (Dimensions.get('window').width / 2) + (CARD_WIDTH / 2),
          duration: 150,
          delay: 0,
          easing: Easing.out(Easing.ease),
        }
      ).start();
    } else if (direction === 'left') {
      Animated.timing(
        this.state.draggedCardX,
        {
          toValue: 0 - ((Dimensions.get('window').width / 2) + (CARD_WIDTH / 2)),
          duration: 150,
          delay: 0,
          easing: Easing.out(Easing.ease),
        }
      ).start();
    } else if (direction === 'up') {
      Animated.timing(
        this.state.draggedCardY,
        {
          toValue: 0 - ((Dimensions.get('window').height / 2) + (CARD_HEIGHT / 2)),
          duration: 150,
          delay: 0,
          easing: Easing.out(Easing.ease),
        }
      ).start();
    } else if (direction === 'down') {
      Animated.timing(
        this.state.draggedCardY,
        {
          toValue: (Dimensions.get('window').height / 2) + (CARD_HEIGHT / 2),
          duration: 150,
          delay: 0,
          easing: Easing.out(Easing.ease),
        }
      ).start();
    }
    // Message top
    Animated.timing(
      this.state.messageTop,
      {
        toValue: 20,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start((result) => {
      this.state.messageTop.setValue(0);
      this.props.onPress();
    });
    //Animated.timing(                          // Base: spring, decay, timing
      //this.state.boxTop,                 // Animate `bounceValue`
      //{
        //toValue: 0,
        //duration: 250, // milliseconds
        //delay: 0, // milliseconds
        //easing: Easing.in(Easing.ease),
      //}
    //).start((result) => {
      //this.state.boxTop.setValue(-100);
      //this.props.onPress();
    //});
  },
  onStartShouldSetResponder: function(e) {
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;
    return true;
  },
  onResponderGrant: function(e) {
  },
  onResponderReject: function(e) {
  },
  onResponderMove: function(e) {
    var dx = e.nativeEvent.pageX - this.startDragX;
    var dy = e.nativeEvent.pageY - this.startDragY;
    //this.state.draggedCardX.setValue(dx);
    this.state.draggedCardY.setValue(dy);
  },
  onResponderRelease: function(e) {
    //var dx = this.startDragX - e.nativeEvent.pageX;
    var dy = this.startDragY - e.nativeEvent.pageY;
    //var dy = Math.abs(this.startDragY - e.nativeEvent.pageY;
    if (dy > 60) {
      this.onPress('up');
    } else if (dy < -60) {
      this.onPress('down');
    }
  },
  onResponderTerminationRequest: function(e) {
  },
  onResponderTerminate: function(e) {
  },
  onModalStartShouldSetResponder: function(e) {
    return true;
  },
  onModalResponderRelease: function(e) {
    this.onPress();
  },
  render: function() {
    var isAction = Pieces[this.props.card] == null;
    var confetti = this.props.youWin ?
      R.map(() => {
        return (<Confetti />);
      }, R.range(1, 75)) : null;
    var children = this.props.card ? 
        (<Animated.View
          style={[
            isAction ? styles.boxLight : styles.boxDark,
            styles.box,
            {
              opacity: this.state.cardOpacity,
              top: this.state.boxTop,
              'transform': [
                {translateX: this.state.draggedCardX},
                {translateY: this.state.draggedCardY},
              ],
            }
          ]}
          onStartShouldSetResponder={this.onStartShouldSetResponder}
          onResponderGrant={this.onResponderGrant}
          onResponderReject={this.onResponderReject}
          onResponderMove={this.onResponderMove}
          onResponderRelease={this.onResponderRelease}
          onResponderTerminationRequest={this.onResponderTerminationRequest}
          onResponderTerminate={this.onResponderTerminate}
        >
          <Image
            source={PieceDisplay[this.props.card].image[isAction ? 'black' : 'white']}
            style={{marginVertical: 20, backgroundColor: 'rgba(0,0,0,0)', width: 42}}
          />
          <PieceInfo
            light={isAction}
            card={this.props.card}
            onAbility={this.onAbility}
            useCard={this.useCard}
          ></PieceInfo>
        </Animated.View>) : null;

    return (
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.modal,
            {opacity: this.state.backgroundOpacity}
          ]}
          onStartShouldSetResponder={this.onModalStartShouldSetResponder}
          onResponderRelease={this.onModalResponderRelease}
        >
        </Animated.View>

        <Animated.View style={[
          styles.message,
          {
            position: 'relative',
            top: this.state.messageTop,
            opacity: this.state.backgroundOpacity,
          }
        ]}>
          {this.props.message}
        </Animated.View>
        {children}
        {confetti}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(255,255,255,0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
  },
  modalButton: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  box: {
    padding: 5,
    borderRadius: 8,
    width: CARD_WIDTH,
    height: 253,
    //width: Math.floor(Dimensions.get('window').width * 0.53),
    //height: Math.floor(Dimensions.get('window').width * 0.53 * 1.48),
    alignItems: 'center',
    flexDirection: 'column',
  },
  boxDark: {
    backgroundColor: '#353535',
  },
  boxLight: {
    backgroundColor: '#D8D8D8',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'black',
  },
});

module.exports = Modal;
