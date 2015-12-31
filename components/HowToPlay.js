var React = require('react-native');

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
  require('../images/tutorial/tutorial-1.png'),
  require('../images/tutorial/tutorial-2.png'),
  require('../images/tutorial/tutorial-3.png'),
  require('../images/tutorial/tutorial-4.png')
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
    }, 1000);
  },
  componentWillUnmount: function() {
    clearInterval(interval);
  },
  render: function() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          The Basics
        </Text>
        <Text style={styles.body}>
          Fortress plays just like chess, except each player gets to choose which pieces they play with, and where to place them at the beginning of the match. In addition to that, lots of new exciting pieces have been added with different types of movement and abilities.
        </Text>
        <Text style={styles.header}>
          Movement
        </Text>
        <Text style={styles.body}>
          In order to describe the movement of all the new pieces (as well as the original pieces) a specific type of notation is used. For example, a Knight's movement looks like this: <Text style={styles.bold}>1(1/2)</Text>
        </Text>
        <Image source={this.state.image} />
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
    fontWeight: 'bold'
  },
  body: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 19
  },
  italic: {
    fontStyle: 'italic'
  },
  bold: {
    fontWeight: 'bold'
  },
  container: {
    padding: 15
  }
});

module.exports = HowToPlay;
