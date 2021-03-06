var React = require('react');
var ReactNative = require('react-native');
var Colors = require('../lib/colors');
var TitleBar = require('./TitleBar.js');

var {
  StyleSheet,
  Text,
  Dimensions,
  View,
  Image,
  ScrollView,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
} = ReactNative;

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
      <View style={{
        flex: 1,
      }}>
        <TitleBar
          onLeftPress={this.back}
          onCenterPress={() => { return; }}
          onRightPress={this.next}
          leftText={'‹'}
          centerText={'How to Play'}
          rightText={''}
        />
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>
            THE BASICS
          </Text>
          <Text style={styles.body}>
            Fortress is a game that combines elements of Chess and trading card games like Magic The Gathering. The game takes place on a 7x7 board, and each player starts with one king, and a deck of 30 cards. Player 1 draws 4 cards into their hand, and Player 2 draws 5. From here on out, each player can perform 2 <Text style={styles.bold}>actions</Text> during their turn. Actions include: moving a piece, using a card, drawing a card, or using a piece's ability (not all piece's have abilities). The first player to capture or destroy all of their opponents royal pieces (e.g. the King is a royal piece, and you can have more than one on the board!) wins the game.
          </Text>
          <Text style={styles.header}>
            MOVEMENT
          </Text>
          <Text style={styles.body}>
            In order to describe the movement of all the new pieces (as well as the original pieces) a specific type of notation is used. For example, a Knight's movement looks like this: <Text style={styles.bold}>1(1/2)</Text>
          </Text>
          <Image style={{width: 320, height: 384, alignSelf: 'center'}} source={this.state.image} />
          <Text style={styles.body}>
              The knight can move one square in any direction, plus 2 squares in the perpendicular direction, and can make 1 leap total. For comparison, a Pawn's initial movement looks like this: <Text style={styles.bold}>2(1/0)</Text>. That is, it can move one square in one direction, 0 in the other, and can make 1 or 2 leaps total. If a piece can make more than one leap, <Text style={styles.italic}>it has to make subsequent leaps in the same direction</Text>.
          </Text>
          <Text style={styles.header}>
            ECONOMY
          </Text>
          <Text style={styles.body}>
            Each card costs a certain amount of gold to play. Some cards cost 0 gold. Each player starts a match with 2 gold, and acquire more throughtout the game through various cards and pieces. The King has an ability called "Tax" which generates +1 gold for the player.
          </Text>
          <Text style={styles.header}>
            PIECES
          </Text>
          <Text style={styles.body}>
            Most Pieces can move about the board according to their movement notation. Pieces without movement notation either cannot move at all (most buildings/structures) or have some non-standard form of movement (i.e. the Teleporter).
          </Text>
          <Text style={styles.body}>
            Additionally, some pieces have an <Text style={styles.bold}>Ability</Text>. Pieces with an ability will have a description of the ability on the card, and a button to activate the ability when the piece is selected on the board (pieces must be deployed to the board before you can activate their ability). Once a piece takes an action, whether it be moving across the board, or activating an ability, it becomes inactive for the rest of the turn and cannot perform any additional actions.
          </Text>
        </ScrollView>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  header: {
    fontFamily: 'Source Code Pro',
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.foregroundBright,
    marginHorizontal: 20,
  },
  body: {
    fontSize: 14,
    color: Colors.foreground,
    marginBottom: 20,
    lineHeight: 21,
    marginHorizontal: 20,
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.foregroundBright,
  },
  container: {
  }
});

module.exports = HowToPlay;
