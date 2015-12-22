{
  'bloodlust': {
//  onCapture :: (Piece, Board) -> Board
    onCapture: function(piece, board) {
      return Board.of(evolve({
        pieces: adjust(
                  compose(
                    Piece.of,
                    evolve({
                      parlett: map(evolve({ distance: add(1) })) })),
                  indexOf(piece, board.pieces))
      }, board));
    } // bloodlust#onCapture
  }, // bloodlust
  'bomber': {
    onCapture: function(piece, board) {
      return board;
    } // bomber#onCapture
  } // bomber
}
