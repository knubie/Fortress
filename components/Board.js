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
  getLastMove: function() {
    // FIXME: make this less birttle
    console.log(this.props.lastMove);
    if (this.props.lastMove === 'draft' || this.props.lastMove == null || this.props.lastMove === 'draw') {
      return [Types.Position.of({x: -1, y: -1}),
              Types.Position.of({x: -1, y: -1})];
    } else {
      return this.props.lastMove
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
            var highlight = false;
            var capture = false;
            if (R.find(R.whereEq({x,y}), this.props.possibleMoves)) {
              highlight = true;
            }
            if (R.find(R.whereEq({x,y}), this.props.possibleCaptures)) {
              capture = true;
            }
            return (
              <Square color={color}
                      highlight={highlight}
                      capture={capture}
                      selected={
                        R.whereEq({x,y},
                        R.prop('position',
                               (this.props.selectedPiece || {position: {}})))}
                      highlightLastMove={
                        R.any(R.whereEq({x, y}), this.getLastMove())
                      }
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
    justifyContent: 'space-between',
    backgroundColor: '#212121',
    marginHorizontal: 20,
  }
});

module.exports = Board;
//module.exports = Board;
