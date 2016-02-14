var R = require('ramda');
var React = require('react-native');
var Tag = require('./Tag');
var PieceDisplay = require('../lib/piece-display');
var Cards = require('../engine/Cards');
var Pieces = require('../engine/Pieces');
var Types = require('../engine/Types');

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
      distance = p.distance === 'n' ? '∞' : p.distance;
      distanceSize = p.distance === 'n' ? styles.distanceInfinite : null;
      movement = p.movement.split('/');
      var movementDivider = p.conditions ? (<View style={styles.movementDivider}/>) : null;
      return (
        <View style={styles.movement}>
          <Text style={[styles.movementText, styles.movementOuterText]}>{direction + ' ' + conditions}</Text>
          {movementDivider}
          <Text style={[styles.movementText, styles.movementOuterText, distanceSize]}>{distance}</Text>
          <View style={styles.movementInner}>
            <Text style={[styles.movementText, styles.movementInnerText]}>{movement[0]}</Text>
            <View style={styles.movementInnerDivider}/>
            <Text style={[styles.movementText, styles.movementInnerText]}>{movement[1]}</Text>
          </View>
        </View>
      );
      //return (<Tag type={'movement'}
                   //text={direction + ' ' + conditions + distance + '(' + p.movement + ')'}
              ///>);
    }, parlett);
  },
  ability: function() {
    if (R.is(Types.Piece, this.props.card)) {
      this.props.onAbility(this.props.card);
    }
  },
  useCard: function() {
    this.props.useCard();
  },
  render: function() {
    var TouchableElement = TouchableHighlight;
    var ability = null;
    if (Platform.OS === 'android') {
     TouchableElement = TouchableNativeFeedback;
    }
    // FIXME: don't hardcode this.
    if (R.is(Types.Piece, this.props.card) && this.props.card.name === 'bomber') {
    //if (this.props.piece && this.props.piece.position.x > -1 && this.props.piece.name === 'bomber') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>DETONATE</Text>
          </TouchableElement>
        </View>
      );
    } else if (R.is(Types.Piece, this.props.card) && this.props.card.name === 'king') {
    //} else if (this.props.piece && this.props.piece.position.x > -1 && this.props.piece.name === 'king') {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.ability}>
            <Text style={styles.buttonText}>TAX</Text>
          </TouchableElement>
        </View>
      );
    } else if (!R.is(Types.Piece, this.props.card) && !Pieces[this.props.card]) {
      ability = (
        <View style={styles.buttonContainer}>
          <TouchableElement style={styles.button} onPress={this.useCard}>
            <Text style={styles.buttonText}>USE</Text>
          </TouchableElement>
        </View>
      );
    }

    var movementTags = null;
    if (Pieces[this.props.card]) {
      movementTags = this.movementTags(Pieces[this.props.card].parlett);
    }

    console.log(this.props.card);
    var pieceDisplay = R.is(Types.Piece, this.props.card) ?
      PieceDisplay[this.props.card.name] :
      PieceDisplay[this.props.card];

    return !this.props.card ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <View style={styles.textContainer}>
          <View style={styles.title}>
            <Text style={styles.name}>{pieceDisplay.displayName}</Text>
          </View>
          <Text style={styles.description}>
            {pieceDisplay.description}
          </Text>
          {ability}
          <View style={styles.tags}>
            {movementTags}
          </View>
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
  },
  title: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  name: {
    fontFamily: 'Helvetica Neue',
    fontSize: 14,
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
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginBottom: 10,
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
  },
  movement: {
    borderRadius: 7,
    backgroundColor: '#6D6D6D',
    height: 14,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    paddingLeft: 4,
    marginHorizontal: 3,
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
});

module.exports = PieceInfo;
