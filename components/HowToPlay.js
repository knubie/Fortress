var React = require('react-native');
var Colors = require('../lib/colors');
var TitleBar = require('./TitleBar.js');

var {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
} = React;

var tutorialImage = [
  require('../assets/how-to-play/movement-frames/frame1.png'),
  require('../assets/how-to-play/movement-frames/frame2.png'),
  require('../assets/how-to-play/movement-frames/frame3.png'),
  require('../assets/how-to-play/movement-frames/frame4.png'),
  require('../assets/how-to-play/movement-frames/frame5.png')
];
var interval = null;

var HowToPlay = React.createClass({
  getInitialState: function() {
    return {
      image: tutorialImage[0]
    }
  },
  componentDidMount: function() {
    var i = 0;
    interval = setInterval(() => {
      i = i + 1;
      if (i >= tutorialImage.length) {
        i = 0;
      }
      this.setState({
        image: tutorialImage[i]
      });
    }, 2000);
  },
  componentWillUnmount: function() {
    clearInterval(interval);
  },
  back: function() {
    this.props.navigator.pop();
  },
  render: function() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'How to Play'}
          rightText={''}
        />
        <Text style={styles.header}>
          The Basics
        </Text>
        <Text style={styles.body}>
          Fortress is a game that combines elements of Chess and trading card games like Magic The Gathering. The game takes place on a 7x7 board, and each player starts with one king, and a deck of 20 cards. Player 1 draws 4 cards into their hand, and Player 2 draws 5. From here on out, each player can perform 2 actions during their turn. Actions include: moving a piece, using a card, drawing a card, or using a piece's special ability. The first player to capture or destroy all of their opponents royal pieces (e.g. king) wins the game.
        </Text>
        <Text style={styles.header}>
          Movement
        </Text>
        <Text style={styles.body}>
          In order to describe the movement of all the new pieces (as well as the original pieces) a specific type of notation is used. For example, a Knight's movement looks like this: <Text style={styles.bold}>1(1/2)</Text>
        </Text>
        <Image style={{width: 320, height: 384}} source={this.state.image} />
        <Text style={styles.body}>
          The knight can move one square in any direction, plus 2 squares in the perpendicular direction, and can make 1 leap total. For comparison, a Pawn's initial movement looks like this: <Text style={styles.bold}>2(1/0)</Text>. That is, it can move one square in one direction, 0 in the other, and can make 1 or 2 leaps total. If a piece can make more than one leap, <Text style={styles.italic}>it has to make subsequent leaps in the same direction</Text>.
        </Text>
      </ScrollView>
    );
  }
});

var styles = StyleSheet.create({
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.foreground,
    marginHorizontal: 20,
  },
  body: {
    fontSize: 13,
    color: Colors.foreground,
    marginBottom: 20,
    lineHeight: 19,
    marginHorizontal: 20,
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold'
  },
  container: {
  }
});

module.exports = HowToPlay;
