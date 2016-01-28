var R = require('ramda');
var React = require('react-native');
var Tag = require('./Tag');
var PieceDisplay = require('../lib/piece-display');

var {
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
            <Text style={styles.buttonText}>Detonate</Text>
          </TouchableElement>
        </View>
      );
    } else if (this.props.piece && this.props.piece.name === 'mine') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>Get 1 extra gold</Text>
          </TouchableElement>
        </View>
      );
    }

    return !this.props.piece ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <Image source={PieceDisplay[this.props.piece.name].image.white}
        style={styles.portrait} />
        <View style={styles.textContainer}>
          <Text style={styles.name}>{PieceDisplay[this.props.piece.name].displayName}</Text>
          <View style={styles.tags}>
            {R.map(
               (type) => {
                 return (<Tag type={type} />);
               }, this.props.piece.types)
            }
          </View>
          <Text style={styles.description}>
            {PieceDisplay[this.props.piece.name].description}
          </Text>
          <Text style={styles.infoText}>
            Movement: {this.movementText(this.props.piece.parlett)}
          </Text>
          {ability}
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'superscript',
    fontSize: 20,
    color: '#c4c4c4',
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  pieceDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 40,
  },
  pieceDisplayPicture: {
    fontSize: 80
  },
  tags: {
    flex: 1,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  portrait: {
    width: 84,
    height: 84,
    marginRight: 5,
  },
  button: {
    padding: 5,
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
    color: '#c4c4c4',
  },
  infoText: {
    color: '#c4c4c4',
  }
});

module.exports = PieceInfo;
