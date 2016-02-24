var R = require('ramda');
var React = require('react-native');
var Tag = require('./Tag');
var MovementTag = require('./MovementTag');
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

    var types;
    var typeList = '';
    if (R.is(Types.Piece, this.props.card)) {
      typeList = R.reduce((prev, type) => {
        return prev + (prev === '  – ' ? ' ' : ', ') + type.charAt(0).toUpperCase() + type.slice(1);
      }, '  – ', this.props.card.types || [])
      types = R.map((type) => {
        if (type === 'royal') {
         return (<Image style={styles.icon} source={require('../assets/crown.png')}/>);
        } else if (type === 'ranged') {
         return (<Image style={styles.icon} source={require('../assets/bow.png')}/>);
        }
       }, this.props.card.types || [])
    } else if (Pieces[this.props.card]) {
      typeList = R.reduce((prev, type) => {
        return prev + (prev === '  – ' ? ' ' : ', ') + type.charAt(0).toUpperCase() + type.slice(1);
      }, '  – ', Pieces[this.props.card].types || [])
      types = R.map((type) => {
        if (type === 'royal') {
         return (<Image style={styles.icon} source={require('../assets/crown.png')}/>);
        } else if (type === 'ranged') {
         return (<Image style={styles.icon} source={require('../assets/bow.png')}/>);
        }
       }, Pieces[this.props.card].types || [])
    }

    typeList = typeList === '  – ' ? '' : typeList;

    var movementTags = null;
    if (R.is(Types.Piece, this.props.card)) {
      movementTags = R.map((p) => {
        return (<MovementTag parlett={p}/>);
      }, this.props.card.parlett);
    } else if (Pieces[this.props.card]) {
      movementTags = R.map((p) => {
        return (<MovementTag parlett={p}/>);
      }, Pieces[this.props.card].parlett);
    }

    var pieceDisplay = R.is(Types.Piece, this.props.card) ?
      PieceDisplay[this.props.card.name] :
      PieceDisplay[this.props.card];

    return !this.props.card ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <View style={styles.textContainer}>
          <View style={styles.title}>
            {types}
            <Text style={styles.name}>{pieceDisplay.displayName}</Text>
          </View>
          <View>
            <Text style={styles.cardTypes}>
              {(Pieces[this.props.card] || R.is(Types.Piece, this.props.card)) ? 'Piece' : 'Action'}
              {typeList}
            </Text>
          </View>
          <View style={styles.divider}/>
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
    marginBottom: 5,
  },
  name: {
    fontFamily: 'Helvetica Neue',
    fontSize: 14,
    fontWeight: '600',
    color: '#D8D8D8',
  },
  cardTypes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#636363',
  },
  divider: {
    width: 70,
    paddingBottom: 7,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3B3B3B',
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
});

module.exports = PieceInfo;
