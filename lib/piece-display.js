var React = require('react-native');
var MovementTag = require('../components/MovementTag');
var CardIcon = require('../components/icons/Card');
var GoldIcon = require('../components/icons/Gold');
var Text = React.Text;
var View = React.View;
var StyleSheet = React.StyleSheet;

var styles = StyleSheet.create({
  description: {
    fontFamily: 'Helvetica Neue',
    fontSize: 12,
    fontWeight: '400',
    color: '#979797',
    textAlign: 'center',
  }
});

var o = function(text) {
  return (style) => { return (<Text style={style}>{text}</Text>); }
};
module.exports = {
  'influence': {
    displayName: 'Influence',
    description: (style) => {
      return (<Text style={[styles.description, style]}>
        Gain +2 plys this turn.
      </Text>);
    },
    'image': {
      'black': require('../assets/influence-black.png'),
    }
  },
  'demotion': {
    displayName: 'Demotion',
    description: (style) => {
      return (<Text style={[styles.description, style]}>
        Transform any non royal piece into a pawn.
      </Text>);
    },
    'image': {
      'black': require('../assets/demotion-black.png'),
    }
  },
  'mind control': {
    displayName: 'Mind Control',
    description: (style) => {
      return (<Text style={[styles.description, style]}>
        Take control of one of your opponent's non-royal pieces.
      </Text>);
    },
    'image': {
      'black': require('../assets/mind-control-black.png'),
    }
  },
  'fortify': {
    displayName: 'Fortify',
    description: (style) => {
      return (<Text style={[styles.description, style]}>
        Grant a piece <Text style={{fontWeight: 'bold', color: '#D8D8D8',}}>invincibility</Text> until the end of your opponent's next turn.
      </Text>);
    },
    'image': {
      'black': require('../assets/fortify-black.png'),
    }
  },
  'church and state': {
    displayName: 'Church and State',
    'description': (style) => {
      return (<View style={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: 'stretch',
        }}>
        <Text style={style}>
          All friendly <Text style={{fontWeight: 'bold', color: '#D8D8D8',}}>Pious</Text> pieces gain </Text><MovementTag parlett={{movement: '1/0', distance: '1'}}/><Text style={style}> movement.
        </Text>
      </View>);
    },
    'image': {
      'black': require('../assets/church-and-state-black.png'),
    }
  },
  steal: {
    displayName: 'Steal',
    'description': (style) => {
      return (<View style={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: 'stretch',
        }}>
        <Text style={style}>
          Steal  </Text><GoldIcon number={'2'}/><Text style={style}> gold from your opponent.
        </Text>
      </View>);
    },
    'image': {
      'black': require('../assets/steal-black.png'),
    }
  },
  perception: {
    'displayName': 'Perception',
    'description': (style) => {
      return (<View style={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: 'stretch',
        }}>
        <Text style={style}>
          Draw  </Text><CardIcon number={'3'}/><Text style={style}> cards.
        </Text>
      </View>);
    },
    //'description': o('Draw 3 cards.'),
    'image': {
      'black': require('../assets/perception-black.png'),
    }
  },
  king: {
    'displayName': 'King',
    'ability': 'tax',
    'description': (style) => {
      return (<View style={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          flexDirection: 'row',
          alignSelf: 'stretch',
        }}>
        <Text style={style}>
          <Text style={{fontWeight: 'bold'}}>Tax</Text>: Gain  </Text><GoldIcon number={'1'}/><Text style={style}> gold per friendly piece on the board.</Text><Text style={style}>Moves like a standard chess King.
        </Text>
      </View>);
    },
    'ability': 'Tax',
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
    'displayName': 'Cannon',
    'description': o('Although limited in mobility, it can capture pieces from afar.'),
    'image': {
      'white': require('../assets/cannon.png'),
      'black': require('../assets/cannon-black.png'),
    }
  },
  'bloodlust': {
    'displayName': 'Bloodlust',
    'description': o('It\'s mobility increases as it captures oponents.'),
    'image': {
      'white': require('../assets/bloodlust.png'),
      'black': require('../assets/bloodlust-black.png'),
    }
  },
  'bomber': {
    'displayName': 'Bomb',
    'ability': 'detonate',
    'description': (style) => {
      return (<Text style={style}>
        <Text style={{fontWeight: 'bold'}}>Detonate</Text>: destroys every piece in a 1 square radius, including friendly pieces and walls.{'\n'}Destroys any piece that captures it.
      </Text>);
    },
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
    'displayName': 'Minister',
    'description': o('The king\'s trusted aide.\nMoves 1 square orthogonally in any direction.'),
    'image': {
      'white': require('../assets/wazir.png'),
      'black': require('../assets/wazir-black.png'),
    }
  },
  'ferz': {
    'displayName': 'Advisor',
    'description': o('A trusted counselor to the King.\nMoves 1 square diagonally in any direction.'),
    'image': {
      'white': require('../assets/ferz.png'),
      'black': require('../assets/ferz-black.png'),
    }
  },
  'archbishop': {
    'displayName': 'Archbishop',
    'description': o('A higher ranked bishop, the Archbishop is mounted and moves like a combination knight/bishop.'),
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
    'description': (<Text><Text style={{fontWeight: 'bold'}}>Tax</Text>: Generates one gold for the kingdom.{'\n'}Automatically generates one Gold for per turn.</Text>),
    'image': {
      'white': require('../assets/mine.png'),
      'black': require('../assets/mine-black.png'),
    }
  },
  'thief': {
    'displayName': 'Thief',
    'description': o('When capturing, gain gold equal to the value of the captured piece less one.'),
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
    'displayName': 'Ranger',
    'description': o('Moves up to 3 steps diagonally, captures up to 4 steps diagonally without moving.'),
    'image': {
      'white': require('../assets/ranger.png'),
      'black': require('../assets/ranger-black.png'),
    }
  }
}

