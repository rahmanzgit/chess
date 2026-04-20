import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { useStockfish } from './useStockfish.js';

// ─── Piece SVGs ───────────────────────────────────────────
const PIECES = {
  wK: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" strokeLinecap="butt" strokeLinejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-11 2c-5 5.5 5.5 9.5 5.5 9.5V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>,
  wQ: () => <svg viewBox="0 0 45 45"><g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z" strokeLinecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none"/></g></svg>,
  wR: () => <svg viewBox="0 0 45 45"><g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinejoin="miter"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" strokeLinejoin="miter" strokeLinecap="butt"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" strokeLinejoin="miter"/></g></svg>,
  wB: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" fill="#fff"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" fill="#fff"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" fill="#fff"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter"/></g></svg>,
  wN: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#fff"/><path d="M24 18c.38 5.12-2.6 6.4-5 8.5 2.5 2.5 8.5 4 8 10" fill="#fff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#000"/><path d="M15 15.5c-.15 1.4-1.85 3.1-3 4.5-1.35 1.55-3 3-3.5 5h21.5" fill="#fff"/></g></svg>,
  wP: () => <svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  bK: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" strokeLinecap="butt" strokeLinejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-11 2c-5 5.5 5.5 9.5 5.5 9.5V37z" fill="#000"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g></svg>,
  bQ: () => <svg viewBox="0 0 45 45"><g fill="#000" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z" strokeLinecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0" fill="none" stroke="#fff"/></g></svg>,
  bR: () => <svg viewBox="0 0 45 45"><g fill="#000" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" strokeLinejoin="miter"/><path d="M14 29.5v-13h17v13H14z" strokeLinejoin="miter" strokeLinecap="butt"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" strokeLinejoin="miter"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="miter"/></g></svg>,
  bB: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" fill="#000"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" fill="#000"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" fill="#000"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" strokeLinejoin="miter"/></g></svg>,
  bN: () => <svg viewBox="0 0 45 45"><g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000"/><path d="M24 18c.38 5.12-2.6 6.4-5 8.5 2.5 2.5 8.5 4 8 10" fill="#000"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill="#fff"/><path d="M15 15.5c-.15 1.4-1.85 3.1-3 4.5-1.35 1.55-3 3-3.5 5h21.5" fill="#000"/></g></svg>,
  bP: () => <svg viewBox="0 0 45 45"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

function PieceIcon({ piece }) {
  const key = piece.color + piece.type.toUpperCase();
  const Icon = PIECES[key];
  return Icon ? <Icon /> : null;
}

// ─── Helpers ──────────────────────────────────────────────
function squareToCoords(square) {
  const file = square.charCodeAt(0) - 97; // a=0..h=7
  const rank = parseInt(square[1]) - 1;   // 1=0..8=7
  return { file, rank };
}

function coordsToSquare(file, rank) {
  return String.fromCharCode(97 + file) + (rank + 1);
}

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function getMaterialDiff(chess) {
  const captured = { w: [], b: [] };
  const board = chess.board();
  const counts = { w: { p:0,n:0,b:0,r:0,q:0 }, b: { p:0,n:0,b:0,r:0,q:0 } };
  const start  = { p:8, n:2, b:2, r:2, q:1 };
  board.forEach(row => row.forEach(sq => { if (sq) counts[sq.color][sq.type]++; }));
  ['p','n','b','r','q'].forEach(t => {
    const wMissing = start[t] - counts.w[t];
    const bMissing = start[t] - counts.b[t];
    for (let i = 0; i < bMissing; i++) captured.w.push(t);
    for (let i = 0; i < wMissing; i++) captured.b.push(t);
  });
  const wScore = captured.w.reduce((s,p) => s + PIECE_VALUES[p], 0);
  const bScore = captured.b.reduce((s,p) => s + PIECE_VALUES[p], 0);
  return { captured, wAdvantage: wScore - bScore };
}

// ─── Promotion Modal ──────────────────────────────────────
function PromotionModal({ color, onSelect }) {
  const pieces = ['q','r','b','n'];
  return (
    <div className="promotion-overlay">
      <div className="promotion-card">
        <p className="promotion-title">Promote Pawn</p>
        <div className="promotion-choices">
          {pieces.map(p => (
            <button key={p} className="promotion-btn" onClick={() => onSelect(p)}>
              <PieceIcon piece={{ color, type: p }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Difficulty Selector ──────────────────────────────────
function DifficultySelect({ onSelect }) {
  return (
    <div className="difficulty-screen">
      <div className="diff-header">
        <div className="diff-crown">♛</div>
        <h1 className="diff-title">Chess</h1>
        <p className="diff-sub">Choose your opponent</p>
      </div>
      <div className="diff-cards">
        {[
          { key: 'easy',   label: 'Squire',   desc: 'Just learning the ropes', icon: '♟', color: '#4ade80' },
          { key: 'medium', label: 'Knight',   desc: 'A worthy challenge',       icon: '♞', color: '#facc15' },
          { key: 'hard',   label: 'Grandmaster', desc: 'Merciless. Unforgiving.', icon: '♛', color: '#f87171' },
        ].map(d => (
          <button key={d.key} className="diff-card" style={{ '--accent': d.color }} onClick={() => onSelect(d.key)}>
            <span className="diff-icon">{d.icon}</span>
            <span className="diff-label">{d.label}</span>
            <span className="diff-desc">{d.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────
function Board({ chess, selectedSquare, legalMoves, lastMove, inCheck, playerColor, onSquareClick }) {
  const ranks = playerColor === 'w' ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
  const files = playerColor === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

  return (
    <div className="board">
      {ranks.map(rank => (
        files.map(file => {
          const square = coordsToSquare(file, rank);
          const piece = chess.get(square);
          const isLight = (file + rank) % 2 === 1;
          const isSelected = selectedSquare === square;
          const isLegal = legalMoves.includes(square);
          const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);
          const isCheck = inCheck && piece?.type === 'k' && piece?.color === chess.turn();

          return (
            <div
              key={square}
              className={[
                'cell',
                isLight ? 'cell--light' : 'cell--dark',
                isSelected ? 'cell--selected' : '',
                isLastMove ? 'cell--last' : '',
                isCheck ? 'cell--check' : '',
              ].join(' ')}
              onClick={() => onSquareClick(square)}
            >
              {/* Rank label */}
              {file === (playerColor === 'w' ? 0 : 7) && (
                <span className="coord coord--rank">{rank + 1}</span>
              )}
              {/* File label */}
              {rank === (playerColor === 'w' ? 0 : 7) && (
                <span className="coord coord--file">{String.fromCharCode(97 + file)}</span>
              )}
              {/* Legal move dot/ring */}
              {isLegal && (
                <div className={`legal-hint ${piece ? 'legal-hint--capture' : 'legal-hint--move'}`} />
              )}
              {/* Piece */}
              {piece && (
                <div className={`piece ${isSelected ? 'piece--selected' : ''}`}>
                  <PieceIcon piece={piece} />
                </div>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────
export default function App() {
  const [difficulty, setDifficulty] = useState(null);
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing'); // playing | checkmate | stalemate | draw
  const [thinking, setThinking] = useState(false);
  const [promotion, setPromotion] = useState(null); // { from, to }
  const [moveHistory, setMoveHistory] = useState([]);
  const playerColor = 'w';
  const aiColor = 'b';
  const historyRef = useRef(null);

  const syncState = useCallback(() => {
    setFen(chess.fen());
    if (chess.isCheckmate()) setGameStatus('checkmate');
    else if (chess.isStalemate()) setGameStatus('stalemate');
    else if (chess.isDraw()) setGameStatus('draw');
    else setGameStatus('playing');
  }, [chess]);

  const { getMove } = useStockfish(difficulty, useCallback((moveStr) => {
    const from = moveStr.slice(0,2);
    const to   = moveStr.slice(2,4);
    const promo = moveStr[4] || undefined;
    chess.move({ from, to, promotion: promo || 'q' });
    setLastMove({ from, to });
    setMoveHistory(chess.history({ verbose: false }));
    syncState();
    setThinking(false);
  }, [chess, syncState]));

  // Trigger AI move
  useEffect(() => {
    if (!difficulty) return;
    if (gameStatus !== 'playing') return;
    if (chess.turn() !== aiColor) return;
    setThinking(true);
    const delay = difficulty === 'hard' ? 400 : 200;
    const t = setTimeout(() => getMove(chess.fen()), delay);
    return () => clearTimeout(t);
  }, [fen, difficulty, gameStatus, chess, getMove]);

  // Scroll move history
  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [moveHistory]);

  const handleSquareClick = useCallback((square) => {
    if (gameStatus !== 'playing') return;
    if (chess.turn() !== playerColor) return;
    if (thinking) return;

    const piece = chess.get(square);

    // Selecting own piece
    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true }).map(m => m.to);
      setLegalMoves(moves);
      return;
    }

    // Making a move
    if (selectedSquare) {
      const move = chess.moves({ square: selectedSquare, verbose: true }).find(m => m.to === square);
      if (!move) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      // Promotion?
      if (move.flags.includes('p')) {
        setPromotion({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      chess.move({ from: selectedSquare, to: square });
      setLastMove({ from: selectedSquare, to: square });
      setMoveHistory(chess.history({ verbose: false }));
      setSelectedSquare(null);
      setLegalMoves([]);
      syncState();
    }
  }, [chess, selectedSquare, gameStatus, playerColor, thinking, syncState]);

  const handlePromotion = (piece) => {
    chess.move({ from: promotion.from, to: promotion.to, promotion: piece });
    setLastMove({ from: promotion.from, to: promotion.to });
    setMoveHistory(chess.history({ verbose: false }));
    setPromotion(null);
    syncState();
  };

  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setGameStatus('playing');
    setThinking(false);
    setPromotion(null);
    setMoveHistory([]);
  };

  const { captured, wAdvantage } = getMaterialDiff(chess);
  const inCheck = chess.inCheck();

  const diffLabel = { easy: 'Squire', medium: 'Knight', hard: 'Grandmaster' }[difficulty] ?? '';

  let statusMsg = '';
  if (gameStatus === 'checkmate') statusMsg = chess.turn() === playerColor ? '☠ You lose — Checkmate' : '♛ You win — Checkmate!';
  else if (gameStatus === 'stalemate') statusMsg = '½ Stalemate — Draw';
  else if (gameStatus === 'draw') statusMsg = '½ Draw';
  else if (inCheck) statusMsg = chess.turn() === playerColor ? '⚠ You are in check!' : '⚠ AI is in check';
  else if (thinking) statusMsg = '... AI is thinking';
  else statusMsg = chess.turn() === playerColor ? 'Your turn (White)' : "AI's turn (Black)";

  if (!difficulty) return <DifficultySelect onSelect={setDifficulty} />;

  // Pair moves into rows
  const movePairs = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push({ n: Math.floor(i/2)+1, w: moveHistory[i], b: moveHistory[i+1] });
  }

  return (
    <div className="app">
      <div className="sidebar sidebar--left">
        {/* AI info */}
        <div className="panel">
          <div className="player-row">
            <span className="player-icon">🤖</span>
            <div>
              <div className="player-name">AI · {diffLabel}</div>
              <div className="captured-row">
                {captured.b.map((p,i) => <span key={i} className="cap-piece cap-piece--white"><PieceIcon piece={{color:'w',type:p}}/></span>)}
                {wAdvantage < 0 && <span className="advantage">+{Math.abs(wAdvantage)}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Move history */}
        <div className="panel panel--grow">
          <div className="panel-title">Moves</div>
          <div className="move-list" ref={historyRef}>
            {movePairs.map(pair => (
              <div key={pair.n} className="move-row">
                <span className="move-num">{pair.n}.</span>
                <span className="move-san move-san--w">{pair.w}</span>
                <span className="move-san move-san--b">{pair.b ?? ''}</span>
              </div>
            ))}
            {moveHistory.length === 0 && <p className="move-empty">No moves yet</p>}
          </div>
        </div>

        {/* Status */}
        <div className={`panel status-panel ${gameStatus !== 'playing' ? 'status-panel--over' : inCheck ? 'status-panel--check' : ''}`}>
          {statusMsg}
        </div>
      </div>

      {/* Board */}
      <div className="board-wrap">
        <Board
          chess={chess}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          inCheck={inCheck}
          playerColor={playerColor}
          onSquareClick={handleSquareClick}
        />
        {promotion && <PromotionModal color={playerColor} onSelect={handlePromotion} />}
      </div>

      <div className="sidebar sidebar--right">
        {/* Player info */}
        <div className="panel">
          <div className="player-row">
            <span className="player-icon">👤</span>
            <div>
              <div className="player-name">You (White)</div>
              <div className="captured-row">
                {captured.w.map((p,i) => <span key={i} className="cap-piece cap-piece--black"><PieceIcon piece={{color:'b',type:p}}/></span>)}
                {wAdvantage > 0 && <span className="advantage">+{wAdvantage}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="panel">
          <div className="panel-title">Game</div>
          <div className="controls">
            <button className="ctrl-btn ctrl-btn--primary" onClick={resetGame}>New Game</button>
            <button className="ctrl-btn ctrl-btn--ghost" onClick={() => setDifficulty(null)}>Change Level</button>
          </div>
        </div>

        {/* Game over card */}
        {gameStatus !== 'playing' && (
          <div className="panel panel--gameover">
            <div className="gameover-icon">
              {gameStatus === 'checkmate' && (chess.turn() === playerColor ? '☠' : '♛')}
              {(gameStatus === 'stalemate' || gameStatus === 'draw') && '½'}
            </div>
            <div className="gameover-text">{statusMsg}</div>
            <button className="ctrl-btn ctrl-btn--primary" onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
