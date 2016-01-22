module.exports = {
  king: {
    'displayName': 'King',
    'description': 'Moves like a normal chess King. Must be captured to lose the game.',
    'image': {
      'white': require('../assets/king.png'),
      'black': require('../assets/king-black.png'),
    }
  },
  queen: {
    'displayName': 'Queen',
    'description': 'Moves like a normal chess Queen.',
    'image': {
      'white': require('../assets/queen.png'),
      'black': require('../assets/queen-black.png'),
    }
  },
  rook: {
    'displayName': 'Rook',
    'description': 'Moves like a normal chess Rook.',
    'image': {
      'white': require('../assets/rook.png'),
      'black': require('../assets/rook-black.png'),
    }
  },
  bishop: {
    'displayName': 'Bishop',
    'description': 'Moves like a normal chess Bishop.',
    'image': {
      'white': require('../assets/bishop.png'),
      'black': require('../assets/bishop-black.png'),
    }
  },
  knight: {
    'displayName': 'Knight',
    'description': 'Moves like a normal chess Knight.',
    'image': {
      'white': require('../assets/knight.png'),
      'black': require('../assets/knight-black.png'),
    }
  },
  pawn: {
    'displayName': 'Pawn',
    'description': 'Moves like a regular chess pawn.',
    'image': {
      'white': require('../assets/pawn.png'),
      'black': require('../assets/pawn-black.png'),
    }
  },
  nightrider: {
    'displayName': 'Nightrider',
    'description': 'A mythical creature said to have ...',
    'image': {
      'white': require('../assets/nightrider.png'),
      'black': require('../assets/nightrider-black.png'),
    }
  },
  'cannon': {
    'displayName': 'Cannon',
    'description': 'Although limited in mobility, it can capture pieces from afar.',
    'image': {
      'white': require('../assets/cannon.png'),
      'black': require('../assets/cannon-black.png'),
    }
  },
  'bloodlust': {
    'displayName': 'Bloodlust',
    'description': 'It\'s mobility increases as it captures oponents.',
    'image': {
      'white': require('../assets/bloodlust.png'),
      'black': require('../assets/bloodlust-black.png'),
    }
  },
  'bomber': {
    'displayName': 'Bomber',
    'description': 'May elect to detonate instead of moving, destroying all adjacent pieces. When captured, destroys whatever piece occupies its position.',
    'image': {
      'white': require('../assets/bomber.png'),
      'black': require('../assets/bomber-black.png'),
    }
  },
  'dabbaba': {
    'displayName': 'Dwarf Rook',
    'description': 'A smaller version of the rook with less movement.',
    'image': {
      'white': require('../assets/dabbaba.png'),
      'black': require('../assets/dabbaba-black.png'),
    }
  },
  'alfil': {
    'displayName': 'Fox Knight',
    'description': 'A small creature mounted atop a fox wielding a dragonglass sabre.',
    'image': {
      'white': require('../assets/alfil.png'),
      'black': require('../assets/alfil-black.png'),
    }
  },
  'wazir': {
    'displayName': 'Minister',
    'description': 'The king\'s trusted aide.',
    'image': {
      'white': require('../assets/wazir.png'),
      'black': require('../assets/wazir-black.png'),
    }
  },
  'ferz': {
    'displayName': 'Advisor',
    'description': 'The king\'s trusted counselor.',
    'image': {
      'white': require('../assets/ferz.png'),
      'black': require('../assets/ferz-black.png'),
    }
  },
  'archbishop': {
    'displayName': 'Archbishop',
    'description': 'A higher ranked bishop, the Archbishop is mounted and moves like a combination knight/bishop.',
    'image': {
      'white': require('../assets/archbishop.png'),
      'black': require('../assets/archbishop-black.png'),
    }
  },
  'empress': {
    'displayName': 'Empress',
    'description': 'Moves like a combination Knight and Rook.',
    'image': {
      'white': require('../assets/empress.png'),
      'black': require('../assets/empress-black.png'),
    }
  },
  'berolina': {
    'displayName': 'Berolina',
    'description': 'Moves opposite of the standard chess Pawn.',
    'image': {
      'white': require('../assets/pawn.png'),
      'black': require('../assets/pawn-black.png'),
    }
  },
  'shapeshifter': {
    'displayName': 'Shapeshifter',
    'description': 'Changes into whatever piece it captures.',
    'image': {
      'white': require('../assets/shapeshifter.png'),
      'black': require('../assets/shapeshifter-black.png'),
    }
  },
  'wall': {
    'displayName': 'Wall',
    'description': 'A reinforced wall, cannot move, cannot be captured.',
    'image': {
      'white': require('../assets/wall.png'),
      'black': require('../assets/wall-black.png'),
    }
  },
  'mine': {
    'displayName': 'Mine',
    'description': 'A Mineshaft that generates 1 gold per turn',
    'image': {
      //TODO update.
      'white': require('../assets/pawn.png'),
      'black': require('../assets/pawn-black.png'),
    }
  },
  'warlord': {
    'displayName': 'Warlord',
    'description': 'A more powerful king, skilled in the art of battle.',
    'image': {
      'white': require('../assets/warlord.png'),
      'black': require('../assets/warlord-black.png'),
    }
  },
  'teleporter': {
    'displayName': 'Teleporter',
    'description': 'The teleporter cannot capture, but it can move to any open square, and swap pieces with friendly pieces',
    'image': {
      'white': require('../assets/teleporter.png'),
      'black': require('../assets/teleporter-black.png'),
    }
  },
  'ranger': {
    'displayName': 'Ranger',
    'description': 'The ranger can capture up to 4 squares diagonally without moving, and can move up to 3 squares diagonally without capturing.',
    'image': {
      'white': require('../assets/ranger.png'),
      'black': require('../assets/ranger-black.png'),
    }
  }
}

