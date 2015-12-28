var R = require('ramda');
var React = require('react-native');
var Piece = require('./Piece');
var Square = require('./Square');
var Chess = require('../engine/Main');
var Types = require('../engine/Types');

var {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  ProgressViewIOS,
  ScrollView,
} = React;

var Board = React.createClass({
  getInitialState: function() {
    return {
      width: this.props.width || this.props.board.size,
      height: this.props.height || this.props.board.size
    }
  },
  render: function() {
    var returnPiece = piece => {
      return piece == null ?
                      null :
                      <Piece
                        piece={piece}
                        onClick={this.props.clickPiece}
                        key={''+piece.x+piece.y}
                      ></Piece>;
    }
    if (this.props.board == null) {
      console.log('board is null!');
    }
    return (
      <View style={styles.boardContainer}>
        {R.flatten(R.map(y => {
          if (this.props.playingFromWhitesPerspective) {
            var y = (this.state.height - 1) - y;
          }
          return R.map(x => {
            if (!this.props.playingFromWhitesPerspective) {
              var x = (this.state.width - 1) - x;
            }
            var color = (x + y) % 2 === 1 ? 'black' : 'white';
            if (R.find(R.whereEq({x,y}), this.props.possibleMoves)) {
              color = color + 'Highlight'
            }
            return (
              <Square color={color}
                      selected={
                        R.whereEq({x,y},
                        R.prop('position',
                               (this.props.selectedPiece || {position: {}})))}
                      onClick={this.props.clickSquare}
                      x={x} y={y} key={''+x+y}
              >
                {returnPiece(R.find(R.compose(
                  R.whereEq({x,y}),
                  R.prop('position')
                ), this.props.board.pieces))}
              </Square>
            );
          }, R.range(0, this.state.width));
        }, R.range(0, this.state.height)))}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

module.exports = Board;
//module.exports = Board;
