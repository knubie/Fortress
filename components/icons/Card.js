var React = require('react');
var ReactNative = require('react-native');

var { View, Text, Image, } = ReactNative;

var CardIcon = React.createClass({
  render: function() {
    return (
      <View style={[{ width: 14, height: 10, }, this.props.viewHeight]} >
        <Image
          style={[{
            width: 14,
            height: 17,
            position: 'relative',
            bottom: 1,
          }, this.props.customStyle
          ]}
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
      </View>
    );
  }
});

module.exports = CardIcon;
