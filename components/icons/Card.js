var React = require('react-native');

var { Text, Image, } = React;

var CardIcon = React.createClass({
  render: function() {
    return (
      <Image
        style={{width: 14, height: 17,}}
        source={require('../../assets/card-icon.png')}
      >
        <Text
          style={{
            position: 'absolute',
            left: 7,
            top: 1,
            fontSize: 9,
            color: '#353535',
            fontWeight: '500',
            backgroundColor: 'rgba(0,0,0,0)',
          }}
        >
          {this.props.number}
        </Text>
      </Image>
    );
  }
});

module.exports = CardIcon;
