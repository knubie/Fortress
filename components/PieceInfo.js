var R = require('ramda');
var React = require('react-native');
var Tag = require('./Tag');
var PieceDisplay = require('../lib/piece-display');

var {
  Dimensions,
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
  StyleSheet,
  Image,
  Text,
  View,
} = React;

var PieceInfo = React.createClass({
  movementTags: function(parlett) {
    return R.map((p) => {
      direction = p.direction === 'forwards' ? '↑' : '';
      conditions = p.conditions ? p.conditions.join('') : '';
      distance = p.distance === 'n' ? '∞' : p.distance
      return (<Tag type={'movement'}
                   text={direction + ' ' + conditions + distance + '(' + p.movement + ')'}
              />);
    }, parlett);
  },
  ability: function() {
    this.props.onAbility(this.props.piece);
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    var ability = null;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    // FIXME: don't hardcode this.
    if (this.props.piece && this.props.piece.position.x > -1 && this.props.piece.name === 'bomber') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>DETONATE</Text>
          </TouchableElement>
        </View>
      );
    } else if (this.props.piece && this.props.piece.position.x > -1 && this.props.piece.name === 'king') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>TAX</Text>
          </TouchableElement>
        </View>
      );
    }

    return !this.props.piece ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <View style={styles.textContainer}>
          <View style={styles.title}>
            {R.map(
               (type) => {
                 if (type === 'royal') {
                   return (<Image style={styles.icon} source={require('../assets/crown.png')}/>);
                 } else if (type === 'ranged') {
                   return (<Image style={styles.icon} source={require('../assets/bow.png')}/>);
                 }
               }, this.props.piece.types)
            }
            <Text style={styles.name}>{PieceDisplay[this.props.piece.name].displayName}</Text>
          </View>
          <Text style={styles.description}>
            {PieceDisplay[this.props.piece.name].description}
          </Text>
          <View style={styles.tags}>
            <Text style={styles.infoText}>
              Movement:
            </Text>
            {this.movementTags(this.props.piece.parlett)}
          </View>
          {ability}
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
    marginTop: 2,
  },
  title: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  name: {
    fontFamily: 'Helvetica Neue',
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Helvetica Neue',
    fontSize: 12,
    fontWeight: '400',
    color: '#979797',
    textAlign: 'center',
    marginBottom: 10,
    width: 300,
  },
  pieceDisplayContainer: {
    marginHorizontal: 20,
  },
  pieceDisplayPicture: {
    fontSize: 80
  },
  tags: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 30,
  },
  portrait: {
    width: 84,
    height: 84,
    marginRight: 5,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#c4c4c4',
    marginBottom: 10,
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
    color: '#c4c4c4',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c4c4c4',
  }
});

module.exports = PieceInfo;
