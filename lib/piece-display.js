var React = require('react');
var ReactNative = require('react-native');
var MovementTag = require('../components/MovementTag');
var CardIcon = require('../components/icons/Card');
var GoldIcon = require('../components/icons/Gold');
var Text = ReactNative.Text;
var View = ReactNative.View;
var StyleSheet = ReactNative.StyleSheet;
var Image = ReactNative.Image;

// Create a description Component, that when passed in a props.card, returns
// the description text.

var styles = StyleSheet.create({
  description: {
    fontFamily: 'Helvetica Neue',
    fontSize: 12,
    fontWeight: '400',
    color: '#979797',
    textAlign: 'center',
  },
  strong: {
    fontWeight: 'bold',
    color: '#cccccc',
  },
  // TODO: make color dynamic.
  name: {
    fontFamily: 'Source Code Pro',
    fontSize: 10,
    fontWeight: '600',
    //color: this.props.light ? Colors.background : Colors.foreground,
  },
});

var action = (<View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: '#C4C4C4'}}/>);

var o = function(text) {
  return (style) => { return (<Text style={style}>{text}</Text>); }
};
module.exports = {
  pin: {
    'displayName': 'Pin',
    'description': o(
      <Text>
        Pin an enemy piece. The next time it moves, gain <GoldIcon number={'2'}/> gold and draw <CardIcon number={'3'}/> cards.
      </Text>
    ),
    'image': {
      'white': require('../assets/pinned.png'),
      'black': require('../assets/pinned-black.png'),
    }
  },
  factory: {
    'displayName': 'Factory',
    'actions': [
      {
        actions: 1,
        text: o(
          <Text>
            Gain <GoldIcon number={'1'}/> gold, draw <CardIcon number={'1'}/> card.
          </Text>
        ),
      },
    ],
    'description': o(''),
    'image': {
      'white': require('../assets/factory.png'),
      'black': require('../assets/factory-black.png'),
    }
  },
  library: {
    'displayName': 'Library',
    'actions': [
      {
        actions: 1,
        text: o(
          <Text>
            Draw <CardIcon number={'2'}/> cards.
          </Text>
        ),
      },
    ],
    'description': o(''),
    'image': {
      'white': require('../assets/library.png'),
      'black': require('../assets/library-black.png'),
    }
  },
  'demolition': {
    displayName: 'Demolition',
    'description': o(
      <Text>
        Destroy a building, gain <GoldIcon number={'3'}/> gold.
      </Text>
    ),
    image: {
      'black': require('../assets/demolition-black.png'),
      'white': require('../assets/demolition.png'),
    },
  },
  'labor': {
    displayName: 'Peasant Labor',
    'description': o(
      <Text>
        Gain 2 <Text style={styles.strong}>{action} ACTIONS</Text>.
      </Text>
    ),
    image: {
      'black': require('../assets/labor-black.png'),
      'white': require('../assets/labor.png'),
    },
  },
  'investment': {
    displayName: 'Investment',
    'description': o(
      <Text>
        Gain <GoldIcon number={'9'}/> gold.
      </Text>
    ),
    image: {
      'black': require('../assets/investment-black.png'),
      'white': require('../assets/investment.png'),
    },
  },
  'foreign aid': {
    displayName: 'Foreign Aid',
    'description': o(
      <Text>
        Gain <GoldIcon number={'3'}/> gold.
      </Text>
    ),
    image: {
      'black': require('../assets/foreign-aid-black.png'),
      'white': require('../assets/foreign-aid.png'),
    },
  },
  'coffer upgrade': {
    displayName: 'Coffer Upgrade',
    'description': o(
      <Text>
        Increase your maximum <GoldIcon number={''}/> gold storage by 5.
      </Text>
    ),
    'image': {
      'black': require('../assets/coffer-upgrade-black.png'),
      'white': require('../assets/coffer-upgrade.png'),
    }
  },
  'influence': {
    displayName: 'Influence',
    'description': o(
      <Text>
        Gain 1 <Text style={styles.strong}>ACTION</Text> at the beginning of your next turn.
      </Text>
    ),
    'image': {
      'black': require('../assets/influence-black.png'),
      'white': require('../assets/influence.png'),
    }
  },
  'demotion': {
    displayName: 'Demotion',
    'description': o(
      <Text>
        Transform any non royal piece into a <Text style={styles.name}>PAWN</Text>.
      </Text>
    ),
    'image': {
      'black': require('../assets/demotion-black.png'),
      'white': require('../assets/demotion.png'),
    }
  },
  'mind control': {
    displayName: 'Mind Control',
    'description': o(
      <Text>
        Take control of one of your opponent's non-royal pieces.
      </Text>
    ),
    'image': {
      'black': require('../assets/mind-control-black.png'),
      'white': require('../assets/mind-control.png'),
    }
  },
  'fortify': {
    displayName: 'Fortify',
    'description': o(
      <Text>
        Grant a piece <Text style={styles.strong}>INVINCIBILITY</Text> until the end of your opponent's next turn.
      </Text>
    ),
    'image': {
      'black': require('../assets/fortify-black.png'),
      'white': require('../assets/fortify.png'),
    }
  },
  'church and state': {
    displayName: 'Church and State',
    'description': o(
      <Text>
        All friendly <View style={{width: 19, height: 19}}><Image style={{position: 'relative', right: 3, top: 5,}} source={require('../assets/cross.png')}/></View><Text style={styles.strong}>PIOUS</Text> pieces gain <MovementTag customStyle={{width: 52, height: 14,}} yOffset={{position: 'relative', top: 1}} parlett={{movement: '1/0', distance: '1',}}/> movement.
      </Text>
    ),
    'image': {
      'black': require('../assets/church-and-state-black.png'),
      'white': require('../assets/church-and-state.png'),
    }
  },
  steal: {
    displayName: 'Steal',
    'description': o(
      <Text>
        Steal <GoldIcon number={'1'}/> from your opponent, plus <GoldIcon number={'1'}/> for every Thief you have in play.
      </Text>
    ),
    'image': {
      'black': require('../assets/steal-black.png'),
      'white': require('../assets/steal.png'),
    }
  },
  perception: {
    'displayName': 'Perception',
    'description': o(
      <Text>
        Draw <CardIcon number={'3'}/> cards.
      </Text>
    ),
    //'description': o('Draw 3 cards.'),
    'image': {
      'black': require('../assets/perception-black.png'),
      'white': require('../assets/perception.png'),
    }
  },
  king: {
    'displayName': 'King',
    'actions': [
      {
        actions: 1,
        text: o(
          <Text>
            Gain <GoldIcon number={'1'}/> gold.
          </Text>
        ),
      },
    ],
    'description': o(
      <Text>
        Moves like a standard chess King.
      </Text>
    ),
    'image': {
      'white': require('../assets/king.png'),
      'black': require('../assets/king-black.png'),
    }
  },
  queen: {
    'displayName': 'Queen',
    'description': o('Moves like a standard chess Queen.'),
    'image': {
      'white': require('../assets/queen.png'),
      'black': require('../assets/queen-black.png'),
    }
  },
  rook: {
    'displayName': 'Rook',
    'description': o('Moves like a standard chess Rook.'),
    'image': {
      'white': require('../assets/rook.png'),
      'black': require('../assets/rook-black.png'),
    }
  },
  bishop: {
    'displayName': 'Bishop',
    'description': o('Moves like a standard chess Bishop.'),
    'image': {
      'white': require('../assets/bishop.png'),
      'black': require('../assets/bishop-black.png'),
    }
  },
  knight: {
    'displayName': 'Knight',
    'description': o('Moves like a standard chess Knight.'),
    'image': {
      'white': require('../assets/knight.png'),
      'black': require('../assets/knight-black.png'),
    }
  },
  pawn: {
    'displayName': 'Pawn',
    'description': o('Moves like a standard chess pawn.'),
    'image': {
      'white': require('../assets/pawn.png'),
      'black': require('../assets/pawn-black.png'),
    }
  },
  nightrider: {
    'displayName': 'Nightrider',
    'description': o('A mythical creature said to have ...'),
    'image': {
      'white': require('../assets/nightrider.png'),
      'black': require('../assets/nightrider-black.png'),
    }
  },
  'cannon': {
    'displayName': 'Long Bowman',
    'description': o('Although limited in mobility, it can capture pieces from afar.'),
    'image': {
      'white': require('../assets/cannon.png'),
      'black': require('../assets/cannon-black.png'),
    }
  },
  'bloodlust': {
    'displayName': 'Bloodlust',
    'description': o('Movement increases 1 step for each piece it captures. May capture friendly pieces.'),
    'image': {
      'white': require('../assets/bloodlust.png'),
      'black': require('../assets/bloodlust-black.png'),
    }
  },
  'bomber': {
    'displayName': 'Bomb',
    'actions': [
      {
        actions: 1,
        text: o(
          <Text>
            Destroy ALL adjacent pieces.
          </Text>
        ),
      },
    ],
    'description': o(
      <Text>
        Destroys any piece that lands on it.
      </Text>
    ),
    'image': {
      'white': require('../assets/bomber.png'),
      'black': require('../assets/bomber-black.png'),
    }
  },
  'dabbaba': {
    'displayName': 'Dwarf Knight',
    'description': o('Leaps 2 squares orthogonally in any direction.'),
    'image': {
      'white': require('../assets/dabbaba.png'),
      'black': require('../assets/dabbaba-black.png'),
    }
  },
  'alfil': {
    'displayName': 'Fox Knight',
    'description': o('Leaps 2 squares diagonally in any direction.'),
    'image': {
      'white': require('../assets/alfil.png'),
      'black': require('../assets/alfil-black.png'),
    }
  },
  'wazir': {
    'displayName': 'Advisor',
    'description': o('The king\'s trusted aide.\nMoves 1 square orthogonally in any direction.'),
    'image': {
      'white': require('../assets/ferz.png'),
      'black': require('../assets/ferz-black.png'),
    }
  },
  'ferz': {
    'displayName': 'Minister',
    'description': o('A low level servant of the clergy.\nMoves 1 square diagonally in any direction.'),
    'image': {
      'white': require('../assets/wazir.png'),
      'black': require('../assets/wazir-black.png'),
    }
  },
  'archbishop': {
    'displayName': 'Archbishop',
    'description': o('A higher ranked bishop, moves like a combination knight/bishop compound.'),
    'image': {
      'white': require('../assets/archbishop.png'),
      'black': require('../assets/archbishop-black.png'),
    }
  },
  'empress': {
    'displayName': 'Empress',
    'description': o('Moves like a combination Knight and Rook.'),
    'image': {
      'white': require('../assets/empress.png'),
      'black': require('../assets/empress-black.png'),
    }
  },
  'berolina': {
    'displayName': 'Berolina',
    'description': o('Moves opposite of the standard chess Pawn.'),
    'image': {
      'white': require('../assets/berolina.png'),
      'black': require('../assets/berolina-black.png'),
    }
  },
  'shapeshifter': {
    'displayName': 'Shapeshifter',
    'description': o('Changes into whatever piece it captures.'),
    'image': {
      'white': require('../assets/shapeshifter.png'),
      'black': require('../assets/shapeshifter-black.png'),
    }
  },
  'wall': {
    'displayName': 'Wall',
    'description': o('A reinforced wall, cannot move, cannot be captured.'),
    'image': {
      'white': require('../assets/wall.png'),
      'black': require('../assets/wall-black.png'),
    }
  },
  'mine': {
    'displayName': 'Bank',
    'description': o(
      <Text>
        At the start of your turn, gain <GoldIcon number={'1'}/> gold.
      </Text>
    ),
    'image': {
      'white': require('../assets/mine.png'),
      'black': require('../assets/mine-black.png'),
    }
  },
  'thief': {
    'displayName': 'Thief',
    'description': o(
      <Text>
        When capturing, gain <GoldIcon number={''}/> equal to the value of the captured piece.
      </Text>
    ),
    'image': {
      'white': require('../assets/thief.png'),
      'black': require('../assets/thief-black.png'),
    }
  },
  'warlord': {
    'displayName': 'Warlord',
    'description': o('A more powerful king, skilled in the art of battle.'),
    'image': {
      'white': require('../assets/warlord.png'),
      'black': require('../assets/warlord-black.png'),
    }
  },
  'teleporter': {
    'displayName': 'Teleporter',
    'description': o('Can move to any open square, or swap places with any friendly piece. Cannot capture.'),
    'image': {
      'white': require('../assets/teleporter.png'),
      'black': require('../assets/teleporter-black.png'),
    }
  },
  'ranger': {
    'displayName': 'Archer',
    'description': o('Moves up to 2 steps diagonally, captures up to 3 steps diagonally without moving.'),
    'image': {
      'white': require('../assets/ranger.png'),
      'black': require('../assets/ranger-black.png'),
    }
  }
}

