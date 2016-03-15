var React = require('react-native');
var Pieces = require('../engine/Pieces');
var PieceInfo = require('./PieceInfo.js');
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
} = React;

var Modal = React.createClass({
  PropTypes: {
    message: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      backgroundOpacity: new Animated.Value(0),
      messageTop: new Animated.Value(0),
      boxTop: new Animated.Value(0),
      draggedCardX: 0,
      draggedCardY: 0,
    };
  },
  componentDidMount: function() {
    this.state.backgroundOpacity.setValue(0);
    Animated.timing(
      this.state.backgroundOpacity,
      {
        toValue: 0.8,
        duration: 150,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }
    ).start();
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
    //this.state.boxTop.setValue(-100);
    //Animated.spring(                          // Base: spring, decay, timing
      //this.state.boxTop,                 // Animate `bounceValue`
      //{
        //toValue: ((Dimensions.get('window').height)/2) - 50,
        //friction: 7,
        //tension: 50,
        ////duration: 150, // milliseconds
        ////delay: 0, // milliseconds
        ////easing: Easing.out(Easing.ease),
      //}
    //).start();
  },
  onPress: function() {
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
        //toValue: Dimensions.get('window').height,
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
    this.setState({
      draggedCardX: dx,
      draggedCardY: dy,
    });
  },
  onResponderRelease: function(e) {
    var dx = Math.abs(this.startDragX - e.nativeEvent.pageX);
    var dy = Math.abs(this.startDragY - e.nativeEvent.pageY);
    if (dx > 60 || dy > 60) {
      this.onPress();
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
    var children = this.props.card ? 
        (<Animated.View
          style={[
            isAction ? styles.boxLight : styles.boxDark,
            styles.box,
            {
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
    fontSize: 12,
    color: '#D8D8D8',
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
    padding: 10,
    borderRadius: 8,
    width: 180,
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
