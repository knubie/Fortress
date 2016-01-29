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
  movementText: function(parlett) {
    return R.reduce((first, second) => {
      var head = first === '' ? '' : ', ';
      return first + head + second.distance + '(' + second.movement + ')';
    }, '', parlett);
  },
  movementTags: function(parlett) {
    return R.map((p) => {
      return (<Tag type={'movement'}
                   text={p.distance + '(' + p.movement + ')'}
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
    if (this.props.piece && this.props.piece.name === 'bomber') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>DETONATE</Text>
          </TouchableElement>
        </View>
      );
    } else if (this.props.piece && this.props.piece.name === 'mine') {
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
          <View>
            {R.map(
               (type) => {
                 if (type === 'royal') {
                   return (<Image source={require('../assets/crown.png')}/>);
                 } else if (type === 'ranged') {
                   return (<Image source={require('../assets/bow.png')}/>);
                 }
               }, this.props.piece.types)
            }
          </View>
          <Text style={styles.name}>{PieceDisplay[this.props.piece.name].displayName}</Text>
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
    justifyContent: 'center',

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
    paddingHorizontal: 30,
  },
  pieceDisplayContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  pieceDisplayPicture: {
    fontSize: 80
  },
  tags: {
    flex: 1,
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
    flex: 1,
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
