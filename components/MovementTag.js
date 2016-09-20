var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');

var {
  StyleSheet,
  Image,
  Text,
  View,
} = ReactNative;

var MovementTag = React.createClass({
  render: function() {
    direction = this.props.parlett.direction === 'forwards' ? (<View style={{width: 12, height: 12,}}><Image style={styles.icon} source={require('../assets/forward.png')}/></View>) : null;
    //conditions = this.props.parlett.conditions ? this.props.parlett.conditions.join('') : '';
    var conditions = this.props.parlett.conditions ? this.props.parlett.conditions : [];
    conditions = R.map((condition) => {
      if (condition === 'o') {
        return (<View style={{width: 12, height: 12,}}><Image style={styles.icon} source={require('../assets/non-capturing-light.png')}/></View>);
      } else if (condition === 'c') {
        return (<View style={{width: 12, height: 12,}}><Image style={styles.icon} source={require('../assets/capturing-light.png')}/></View>);
      } else if (condition === 'i') {
        return (<View style={{width: 12, height: 12,}}><Image style={styles.icon} source={require('../assets/initial.png')}/></View>);
      } else {
        return null
      }
    }, conditions);
    distance = this.props.parlett.distance === 'n' ? '∞' : this.props.parlett.distance;
    distanceSize = this.props.parlett.distance === 'n' ? styles.distanceInfinite : null;
    movement = this.props.parlett.movement.split('/');
    var movementDivider = this.props.parlett.conditions ? (<View style={styles.movementDivider}/>) : null;
    return (
      <View style={[this.props.customStyle]}>
        <View style={[styles.movement, this.props.yOffset]}>
          {direction}{conditions}{movementDivider}
          <Text style={[styles.movementText, styles.movementOuterText, distanceSize]}>{distance}</Text>
          <View style={styles.movementInner}>
            <Text style={[styles.movementText, styles.movementInnerText]}>{movement[0]}</Text>
            <View style={styles.movementInnerDivider}/>
            <Text style={[styles.movementText, styles.movementInnerText]}>{movement[1]}</Text>
          </View>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  movement: {
    borderRadius: 7,
    backgroundColor: '#6D6D6D',
    height: 14,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingLeft: 4,
    margin: 3,
    position: 'relative',
    bottom: 1,
  },
  movementDivider: {
    width: 1,
    height: 14,
    marginHorizontal: 5,
    backgroundColor: '#484848',
  },
  movementInnerDivider: {
    width: 2,
    height: 12,
    marginHorizontal: 3,
    backgroundColor: '#6D6D6D',
  },
  movementText: {
    fontFamily: 'Helvetica Neue',
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
    backgroundColor: 'transparent',
  },
  distanceInfinite: {
    position: 'relative',
    top: -4,
    fontSize: 15,
  },
  movementOuterText: {
    position: 'relative',
    top: 0.5,
  },
  movementInnerText: {
    position: 'relative',
    bottom: 0.5,
  },
  movementInner: {
    borderRadius: 7,
    backgroundColor: '#545454',
    paddingLeft: 5,
    paddingRight: 4,
    height: 12,
    margin: 1,
    marginLeft: 3,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  icon: {
    width: 12,
    height: 12,
    position: 'relative',
    top: 1,
  },
});

module.exports = MovementTag;
