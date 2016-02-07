var React = require('react-native');

var {
  Easing,
  Animated,
  Dimensions,
  View,
  PropTypes,
  StyleSheet,
  Text,
} = React;

var Modal = React.createClass({
  PropTypes: {
    message: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      backgroundOpacity: new Animated.Value(0),
      boxTop: new Animated.Value(0),
    };
  },
  componentDidMount: function() {
    this.state.backgroundOpacity.setValue(0);
    Animated.timing(                          // Base: spring, decay, timing
      this.state.backgroundOpacity,                 // Animate `bounceValue`
      {
        toValue: 0.5,                         // Animate to smaller size
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.out(Easing.ease),
      }
    ).start();
    this.state.boxTop.setValue(-100);
    Animated.spring(                          // Base: spring, decay, timing
      this.state.boxTop,                 // Animate `bounceValue`
      {
        toValue: ((Dimensions.get('window').height)/2) - 50,
        friction: 7,
        tension: 50,
        //duration: 150, // milliseconds
        //delay: 0, // milliseconds
        //easing: Easing.out(Easing.ease),
      }
    ).start();
  },
  onPress: function() {
    Animated.timing(                          // Base: spring, decay, timing
      this.state.backgroundOpacity,                 // Animate `bounceValue`
      {
        toValue: 0,                         // Animate to smaller size
        duration: 150, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.in(Easing.ease),
      }
    ).start();
    Animated.timing(                          // Base: spring, decay, timing
      this.state.boxTop,                 // Animate `bounceValue`
      {
        toValue: Dimensions.get('window').height,
        duration: 250, // milliseconds
        delay: 0, // milliseconds
        easing: Easing.in(Easing.ease),
      }
    ).start((result) => {
      this.state.boxTop.setValue(-100);
      this.props.onPress();
    });
  },
  render: function() {
    return (
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modal, {opacity: this.state.backgroundOpacity}]}/>
        <Animated.View style={[styles.box, {top: this.state.boxTop}]}>
          <Text>
            {this.props.text}
          </Text>
          <Text onPress={this.onPress}>OK</Text>
        </Animated.View>
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
  },
  box: {
    padding: 20,
    width: 200,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    left: ((Dimensions.get('window').width)/2) - 100,
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
