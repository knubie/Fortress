var React = require('react-native');
var Colors = require('../../lib/colors');

var { Text, Image, } = React;

var GoldIcon = React.createClass({
  render: function() {
    return (
      <Image
        style={{
          width: 13, height: 12,
          position: 'relative',
          top: 1,
        }}
        source={require('../../assets/gold-icon.png')}
      >
        <Text
          style={{
            position: 'absolute',
            fontWeight: '500',
            left: 5,
            top: 0,
            fontSize: 9,
            color: Colors.darkYellow,
            backgroundColor: 'rgba(0,0,0,0)',
          }}
        >
          {this.props.number}
        </Text>
      </Image>
    );
  }
});

module.exports = GoldIcon;
