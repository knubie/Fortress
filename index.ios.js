var React = require('react-native');
var Home = require('./components/Home');
var { AppRegistry, NavigatorIOS, StyleSheet, } = React;

var Fortress = React.createClass({
  render: function() {
    return (
      <NavigatorIOS
        style={styles.navigator}
        navigationBarHidden={true}
        interactivePopGestureEnabled={true}
        itemWrapperStyle={styles.wrapper}
        initialRoute={{
          component: Home,
          title: 'Home',
          passProps: { route: 'Home' },
        }}
      />
    );
  }
});

var styles = StyleSheet.create({
  navigator: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: '#212121',
    flex: 1,
  },
});

AppRegistry.registerComponent('Fortress', () => Fortress);
