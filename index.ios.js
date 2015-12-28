var React = require('react-native');
var Home = require('./components/Home');
var { AppRegistry, NavigatorIOS, StyleSheet, } = React;

var Fortress = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.navigator}
        initialRoute={{
          component: Home,
          title: 'Home',
          passProps: { },
        }}
      />
    );
  }
});

var styles = StyleSheet.create({
  navigator: {
    flex: 1,
  }
});

AppRegistry.registerComponent('Fortress', () => Fortress);
