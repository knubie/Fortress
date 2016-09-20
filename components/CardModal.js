var R = require('ramda');
var React = require('react');
var ReactNative = require('react-native');
var Pieces = require('../engine/Pieces');
var Cards = require('../engine/Cards');
var Colors = require('../lib/colors');
var PieceInfo = require('./PieceInfo.js');
var PieceDisplay = require('../lib/piece-display');

var {
  ScrollView,
  Easing,
  Image,
  Animated,
  Dimensions,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} = ReactNative;
var {
  PropTypes,
} = React;

var CARD_WIDTH = 180;
var CARD_HEIGHT = 260;
var DURATION = 250;

var CardModal = React.createClass({
  PropTypes: {
    // An array of cards in the player's hand.
    cards: React.PropTypes.array.isRequired,

    // The index of the currently focused card. This will later be multiplied
    // by the scrollInterval to get the raw scrollOffset value.
    scrollOffset: React.PropTypes.number.isRequired,
  },
  getInitialState: function() {
    // The scrollOffset of the scrollView.
    this.scrollOffset = this.props.scrollOffset * (CARD_WIDTH + 30);

    // The initial X and Y positions of the cursor when dragging a card.
    this.startDragY = 0;
    this.startDragX = 0;

    // This variable stores whether we're dragging the cards horizontally
    // or vertically so that we may lock movement in the perpendicular
    // direction.
    this.dragDirection = null; // 'vertical' | 'horizontal'

    return {
      // The delta y value of dragging cards up and down.
      dy: new Animated.Value(0),

      // The index of the card in the center of the scrollView.
      focusedCard: Math.round(this.scrollOffset / (CARD_WIDTH + 30)),

      // Whether or not to lock the scrolLView when dragging cards vertically
      scrollEnabled: true,
      mulliganedCards: [],
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return R.not(R.and(R.equals(nextProps, this.props),
            R.equals(nextState, this.state)))
  },
  componentWillUpdate: function(nextProps, nextState) {
    // When component mounts, the cards will fade up from the bottom.
    if (this.props.hidden === true && nextProps.hidden === false) {
      this.state.dy.setValue(Dimensions.get('window').height / 3);
      Animated.timing(this.state.dy, {
        toValue: 0,
        duration: DURATION,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  },
  onDismiss: function(direction) {
    // This gets called when the cards are dragged down or up.
    var toValue = direction === 'down'
      ? Dimensions.get('window').height / 2
      : 0 - ((Dimensions.get('window').height / 2) + (CARD_HEIGHT / 2));

    var callback = direction === 'down'
      ? (result) => { this.props.onDismiss(); }
      : (result) => { this.props.onUse(this.state.focusedCard); };

    Animated.timing(this.state.dy, {
      toValue,
      duration: DURATION,
      delay: 0,
      easing: Easing.out(Easing.ease),
    }).start(callback);
  },
  snapBack: function() {
    // This gets called when the cards are dragged up or down, but not enough
    // to warrant an action one way or the other, so they are snapped back
    // to their original positions (0).
    Animated.parallel([
      Animated.timing(this.state.dy, {
        toValue: 0,
        duration: DURATION,
        delay: 0,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  },
  handleScroll: function(e) {
    // This gets called once per frame when the cards are scrolling.
    // We're using this to track the currently focused card.
    this.scrollOffset = e.nativeEvent.contentOffset.x;
    var focusedCard = Math.round(this.scrollOffset / (CARD_WIDTH + 30));
    if (focusedCard !== this.state.focusedCard) {
      this.setState({ focusedCard });
    }
  },
  onStartShouldSetResponder: function(e) {
    // Record initial position of the tap.
    this.startDragY = e.nativeEvent.pageY;
    this.startDragX = e.nativeEvent.pageX;

    // Enable scrolling in case it was previously disabled during a
    // vertical drag.
    this.setState({
      scrollEnabled: true
    });

    // Reset dragDirection.
    this.dragDirection = null;

    // Return true to tell the Gesture Responder System that we want this
    // View to become the responder of this touch.
    return true;
  },
  onResponderGrant: function(e) { },
  onResponderReject: function(e) { },
  onResponderMove: function(e) {
    // Record the change in coordinates of the touch.
    var dx = e.nativeEvent.pageX - this.startDragX;
    var dy = e.nativeEvent.pageY - this.startDragY;

    // Here we determine which way the touch is being dragged, so that we
    // may lock movement in the perpendicular direction.
    //
    // E.g. if we're scrolling left or right, we don't want the cards to move
    // up and down. If we're dragging a card up and down we don't want to
    // scroll left and right either.
    if (!this.dragDirection) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dragDirection = 'horizontal';
      } else if (Math.abs(dx) < Math.abs(dy)) {
        this.dragDirection = 'vertical';
        this.setState({
          scrollEnabled: false
        });
      }
    }
    if (this.dragDirection === 'vertical') {
      if (!this.props.mulligan) {
        this.state.dy.setValue(dy);
      }
    }
  },
  onResponderRelease: function(e) {
    var dy = this.startDragY - e.nativeEvent.pageY;
    if (this.dragDirection === 'vertical') {
      if (!this.props.mulligan) {
        if (dy > 60) {
          this.onDismiss('up');
        } else if (dy < -60) {
          this.onDismiss('down');
        } else {
          this.snapBack();
        }
      }
    }
    if (this.dragDirection !== 'horizontal') {
      if (this.props.mulligan) {
        this.props.onMulligan(this.state.focusedCard);
        if (R.contains(this.state.focusedCard, this.state.mulliganedCards)) {
          this.setState({
            mulliganedCards: R.reject(R.equals(this.state.focusedCard), this.state.mulliganedCards),
          });
        } else {
          this.setState({
            mulliganedCards: R.append(this.state.focusedCard, this.state.mulliganedCards),
          });
        }
      }
    }
    this.setState({
      scrollEnabled: true
    });
  },
  onResponderTerminationRequest: function(e) { },
  onResponderTerminate: function(e) { },
  onModalStartShouldSetResponder: function(e) {
    return true;
  },
  onModalResponderRelease: function(e) {
    this.onDismiss();
  },
  onClick: function() {
    console.log('onclick');
    if (this.props.mulligan) {
      if (R.contains(this.state.focusedCard, this.state.mulliganedCards)) {
        console.log('is mulliganed card, un-mulliganing');
        this.setState({
          mulliganedCards: R.reject(R.equals(this.state.focusedCard), this.state.mulliganedCards),
        });
      } else {
        this.setState({
          mulliganedCards: R.append(this.sate.focusedCard, this.state.mulliganedCards),
        });
        console.log('is not, mulliganed card, mulliganing');
      }
    }
  },
  render: function() {

    var cardIndex = 0;
    var title = this.props.mulligan ? "Select cards from your hand to exchange" : "↑ SWIPE UP TO USE ↑";

    return (
      <View style={[
        styles.modalContainer,
        {
          top: this.props.hidden ? Dimensions.get('window').height : 0
        }
      ]}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: this.state.dy.interpolate({
                inputRange: [
                  0 - (Dimensions.get('window').height / 2),
                  0,
                  Dimensions.get('window').height / 2
                ],
                outputRange: [0, 0.8, 0],
              }),
            }
          ]}
          onStartShouldSetResponder={this.onModalStartShouldSetResponder}
          onResponderRelease={this.onModalResponderRelease}
        >
        </Animated.View>
        <Animated.View style={[
          styles.scrollViewContainer,
          {
            opacity: this.state.dy.interpolate({
              inputRange: [0, Dimensions.get('window').height / 3],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            'transform': [
              {
                translateY: this.state.dy.interpolate({
                  inputRange: [
                    0,
                    (Dimensions.get('window').height / 3),
                  ],
                  outputRange: [
                    0,
                    (Dimensions.get('window').height / 3),
                  ],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }
        ]}>
          <Text style={styles.swipeText}>{title}</Text>
          <ScrollView automaticallyAdjustContentInsets={false}
                      horizontal={true}
                      onScroll={this.handleScroll}
                      scrollEventThrottle={16}
                      contentOffset={{
                        x: this.props.scrollOffset * (CARD_WIDTH + 30),
                        y: 0,
                      }}
                      snapToInterval={CARD_WIDTH + 30}
                      snapToAlignment={'start'}
                      scrollEnabled={this.state.scrollEnabled}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.scrollView}>
            {
              R.map((card) => {
                var isAction = Pieces[card] == null;
                var isFocusedCard = cardIndex === this.state.focusedCard;
                var isMulliganed = R.contains(cardIndex, this.state.mulliganedCards);
                var X = isMulliganed ? (
                    <View style={{position: 'absolute', top: 0, left: 0}}>
                      <View style={styles.exLeft} />
                      <View style={styles.exRight} />
                    </View>
                    ) : null;
                cardIndex = cardIndex + 1;
                return (
                  <View style={{
                    alignItems: 'center',
                    flexDirection: 'column',
                  }}>
                  <Animated.View
                    style={[
                      styles.boxDark,
                      styles.box,
                      {
                        opacity: isFocusedCard ? 1 :
                          this.state.dy.interpolate({
                            inputRange: [
                              0 - (Dimensions.get('window').height / 3),
                              0,
                            ],
                            outputRange: [0, 1],
                            extrapolate: 'clamp',
                          }),
                        'transform': [
                          {
                            translateY: !isFocusedCard ? 0 :
                            this.state.dy.interpolate({
                              inputRange: [
                                0 - ((Dimensions.get('window').height / 2) + (CARD_HEIGHT / 2)),
                                0,
                              ],
                              outputRange: [
                                0 - ((Dimensions.get('window').height / 2) + (CARD_HEIGHT / 2)),
                                0,
                              ],
                              extrapolate: 'clamp',
                            })
                          },
                        ],
                      }
                    ]}
                    onStartShouldSetResponder={this.onStartShouldSetResponder}
                    onResponderGrant={this.onResponderGrant}
                    onResponderReject={this.onResponderReject}
                    onResponderMove={this.onResponderMove}
                    onResponderRelease={this.onResponderRelease}
                    onResponderTerminationRequest={this.onResponderTerminationRequest}
                    onResponderTerminate={this.onResponderTerminate}
                    onClick={this.onClick}
                  >
                    <Image
                      source={PieceDisplay[card].image['white']}
                      style={{marginVertical: 20, backgroundColor: 'rgba(0,0,0,0)', width: 42}}
                    />
                    <PieceInfo
                      light={false}
                      card={card}
                      onAbility={this.onAbility}
                      useCard={this.useCard}
                    ></PieceInfo>
                    {X}
                  </Animated.View>
                  <Animated.View style={[
                    {
                      flexWrap: 'wrap',
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 6,
                    },
                    {
                      opacity: this.state.dy.interpolate({
                        inputRange: [
                          0 - (Dimensions.get('window').height / 2),
                          0,
                          Dimensions.get('window').height / 2
                        ],
                        outputRange: [0, 0.8, 0],
                      }),
                    },
                  ]}>
                    <View style={styles.goldLabel}/>
                    <Text style={styles.pointText}>{Cards[card].points}</Text>
                  </Animated.View>
                </View>
                );
              }, this.props.cards)
            }
          </ScrollView>
        </Animated.View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  scrollViewContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    //height: CARD_HEIGHT,
  },
  swipeText: {
    color: 'white',
    position: 'absolute',
    top: ((Dimensions.get('window').height / 2) - (CARD_HEIGHT / 2)) - 25,
    width: Dimensions.get('window').width,
    textAlign: 'center',
    fontFamily: 'Source Code Pro',
    fontSize: 12,
  },
  scrollView: {
    paddingTop: (Dimensions.get('window').height / 2) - (CARD_HEIGHT / 2),
    paddingHorizontal: (Dimensions.get('window').width - (CARD_WIDTH + 30)) / 2,
    height: Dimensions.get('window').height,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(255,255,255,0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginBottom: 10,
  },
  modalText: {
    textAlign: 'center',
  },
  modalButton: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  box: {
    marginHorizontal: 15,
    padding: 5,
    borderRadius: 8,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    //width: Math.floor(Dimensions.get('window').width * 0.53),
    //height: Math.floor(Dimensions.get('window').width * 0.53 * 1.48),
    alignItems: 'center',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: {
      width: 3,
      height: 3,
    },
  },
  boxDark: {
    backgroundColor: '#353535',
  },
  boxLight: {
    backgroundColor: '#D8D8D8',
  },
  boxMulliganed: {
    borderColor: 'red',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'black',
  },
  exLeft: {
    width: 3,
    height: CARD_HEIGHT * 1.28,
    backgroundColor: '#A71515',
    position: 'absolute',
    top: 0 - (((CARD_HEIGHT * 1.28) - CARD_HEIGHT) / 2),
    left: (CARD_WIDTH / 2),
    transform: [
      {rotate: '34deg',}
    ],
  },
  exRight: {
    width: 3,
    height: CARD_HEIGHT * 1.28,
    backgroundColor: '#A71515',
    position: 'absolute',
    top: 0 - (((CARD_HEIGHT * 1.28) - CARD_HEIGHT) / 2),
    left: (CARD_WIDTH / 2),
    transform: [
      {rotate: '-34deg',}
    ],
  },
  goldLabel: {
    marginRight: 4,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#DAB900',
    shadowColor: 'black',
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  pointText: {
    color: '#777777',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: '600',
  },
});

module.exports = CardModal;
