var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var Tag = require('./Tag');
var MovementTag = require('./MovementTag');
var PieceDisplay = require('../lib/piece-display');
var Colors = require('../lib/colors');
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
} = ReactNative;

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


var styles = StyleSheet.create({
  pieceDisplayContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  icon: {
    marginRight: 5,
    position: 'relative',
    bottom: 2,
  },
  title: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginBottom: 5,
    height: 15.5,
  },
  name: {
    fontFamily: 'Source Code Pro',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.foreground,
    //color: this.props.light ? Colors.background : Colors.foreground,
  },
  cardTypes: {
    fontFamily: 'Source Code Pro',
    fontSize: 9,
    color: this.props.abilityButton ? '#636363' : '#777777',
    //color: this.props.light ? '#898989' : '#636363',
  },
  divider: {
    width: 70,
    paddingBottom: 7,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: this.props.abilityButton ? '#3B3B3B' : '#434343',
    //borderBottomColor: this.props.light ? '#C3C3C3' : '#3B3B3B',
  },
  description: {
    marginBottom: 13,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  pieceDescription: {
    fontFamily: 'Source Code Pro',
    fontSize: 10,
    fontWeight: '400',
    color: '#979797',
    lineHeight: 15,
    textAlign: 'center',
    //color: this.props.light ? '#646464' : '#979797',
  },
  abilityDescription: {
    fontFamily: 'Source Code Pro',
    fontSize: 10,
    fontWeight: '400',
    color: '#979797',
    lineHeight: 10,
    textAlign: 'center',
  },
  tags: {
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'stretch',
  },
  portrait: {
    width: 84,
    height: 84,
    marginRight: 5,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderStyle: 'solid',
    borderWidth: 1,
    //borderColor: '#c4c4c4',
    //borderColor: '#212121',
    //backgroundColor: '#c4c4c4',
    borderColor: '#191919',
    backgroundColor: '#191919',
    marginBottom: 5,
  },
  buttonContainer: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 8,
    letterSpacing: 1,
    color: '#c4c4c4',
  },
});

    // FIXME: don't hardcode this.
    if (this.props.abilityButton) {
      if (R.is(Types.Piece, this.props.card) && PieceDisplay[this.props.card.name].ability != null) {
        ability = (
          <View style={styles.buttonContainer}>
            <TouchableElement style={styles.button} onPress={this.ability}>
              <Text style={styles.buttonText}>ACTION</Text>
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
    }

    var types;
    var typeList = '';
    if (R.is(Types.Piece, this.props.card)) {
      typeList = R.reduce((prev, type) => {
        return prev + (prev === ' –' ? ' ' : ', ') + type.charAt(0).toUpperCase() + type.slice(1);
      }, ' –', this.props.card.types || [])
      types = R.map((type) => {
        if (type === 'royal') {
         return (<Image style={styles.icon} source={require('../assets/crown.png')}/>);
        } else if (type === 'ranged') {
         return (<Image style={styles.icon} source={require('../assets/bow.png')}/>);
        } else if (type === 'pious') {
         return (<Image style={styles.icon} source={require('../assets/cross.png')}/>);
        }
       }, this.props.card.types || [])
    } else if (Pieces[this.props.card]) {
      typeList = R.reduce((prev, type) => {
        return prev + (prev === ' –' ? ' ' : ', ') + type.charAt(0).toUpperCase() + type.slice(1);
      }, ' –', Pieces[this.props.card].types || [])
      types = R.map((type) => {
        if (type === 'royal') {
         return (<Image style={styles.icon} source={require('../assets/crown.png')}/>);
        } else if (type === 'ranged') {
         return (<Image style={styles.icon} source={require('../assets/bow.png')}/>);
        } else if (type === 'pious') {
         return (<Image style={styles.icon} source={require('../assets/cross.png')}/>);
        }
       }, Pieces[this.props.card].types || [])
    }

    typeList = typeList === ' –' ? '' : typeList;

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

    if (pieceDisplay && pieceDisplay.actions) {
      var actions = R.map((action) => {
        if (this.props.abilityButton) {
          return (
            <TouchableElement style={styles.button} onPress={this.ability}>
              <Text style={[styles.abilityDescription, {}]}>
                <View style={{
                  width: 6, height: 6,
                  borderRadius: 3,
                  backgroundColor: '#C4C4C4'}}
                /> : {action.text(styles.abilityDescription)}
              </Text>
            </TouchableElement>
          );
        } else {
          return (
            <Text style={[styles.pieceDescription, {}]}>
              <View style={{
                width: 6, height: 6,
                borderRadius: 3,
                backgroundColor: '#C4C4C4'}}
              /> : {action.text(styles.pieceDescription)}
            </Text>
          );
        }
      }, pieceDisplay.actions);
    }

    return !this.props.card ? (<View></View>) : (
      <View style={styles.pieceDisplayContainer}>
        <View style={styles.title}>
          {types}
          <Text style={styles.name}>{pieceDisplay.displayName.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.cardTypes}>
            {(Pieces[this.props.card] || R.is(Types.Piece, this.props.card)) ? 'Piece' : 'Action'}
            {typeList}
          </Text>
        </View>
        <View style={styles.divider}/>
        <View style={styles.description}>
          {actions}
          {pieceDisplay.description(styles.pieceDescription)}
        </View>
        {ability}
        <View style={styles.tags}>
          {movementTags}
        </View>
      </View>
    );
  }
});

module.exports = PieceInfo;
