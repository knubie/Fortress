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
    return [
      R.path(['position'], this.props.lastPly),
      R.path(['piece', 'position'], this.props.lastPly),
    ];
  },
  render: function() {
    var returnPiece = piece => {
      return piece == null ?
                      null :
                      <Piece
                        piece={piece}
                        onClick={this.props.clickPiece}
                        key={''+piece.x+piece.y}
                        movedLast={
                          R.any(R.whereEq(piece.position), this.getLastMove())
                        }
                        attacked={R.find(R.whereEq(piece.position), this.props.possibleMoves)}
                        selected={R.whereEq(
                          piece.position,
                          (R.path(['position'], this.props.selectedPiece) || {})
                        )}
                      ></Piece>;
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
                      movedLast={
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
    //justifyContent: 'space-between',
    backgroundColor: '#212121',
    marginLeft: 20,
  }
});

module.exports = Board;
//module.exports = Board;
