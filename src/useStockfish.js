import { useEffect, useRef, useCallback } from 'react';
import AIWorker from './ai.worker.js?worker';

export function useStockfish(difficulty, onMove) {
  const workerRef = useRef(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  useEffect(() => {
    const worker = new AIWorker();
    worker.onmessage = ({ data: moveStr }) => {
      if (moveStr) onMoveRef.current(moveStr);
    };
    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const getMove = useCallback((fen) => {
    workerRef.current?.postMessage({ fen, difficulty });
  }, [difficulty]);

  return { getMove };
}
