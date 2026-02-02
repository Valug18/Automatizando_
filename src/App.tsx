import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { BlockDef, FeedbackState } from './types';
import { GAME_DATA, CORRECT_ORDER, SCORING } from './constants';
import { Assistant } from './components/Assistant';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import {
  Play,
  RotateCcw,
  AlertTriangle,
  XCircle,
  Timer,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';

/* =======================
   SHUFFLE UTIL (OPCIÓN A)
======================= */
const shuffle = <T,>(array: T[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const App: React.FC = () => {
  /* =======================
     BLOCKS (DESORDENADOS)
  ======================= */
  const initialBlocks = useMemo(() => {
    return shuffle([
      ...GAME_DATA.bloques_disponibles.correctos,
      ...GAME_DATA.bloques_disponibles.distractores
    ]);
  }, []);

  const [canvasBlocks, setCanvasBlocks] = useState<BlockDef[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: 'neutral',
    message: GAME_DATA.mision.descripcion
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  /* =======================
     TIMER
  ======================= */
  useEffect(() => {
    if (isFinished) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentScore = Math.max(
    0,
    SCORING.INITIAL_SCORE -
      elapsedSeconds * SCORING.TIME_PENALTY -
      penalties
  );

  /* =======================
     DROP HANDLER
  ======================= */
  const handleDrop = useCallback(
    (block: BlockDef, index?: number) => {
      if (isFinished) return;

      setCanvasBlocks(prev => {
        const next = [...prev];

        const insertIndex =
          index !== undefined && index !== null
            ? Math.min(index, next.length)
            : next.length;

        next.splice(insertIndex, 0, {
          ...block,
          id: crypto.randomUUID() // id único por instancia
        });

        return next;
      });

      if (block.tipo === 'Distractor') {
        setPenalties(p => p + SCORING.DISTRACTOR_PENALTY);
        setFeedback({
          type: 'error',
          message: `⚠️ Bloque incorrecto detectado. -${SCORING.DISTRACTOR_PENALTY} pts`
        });
      } else {
        setFeedback({
          type: 'neutral',
          message: 'Editando flujo...'
        });
      }
    },
    [isFinished]
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (isFinished) return;
      setCanvasBlocks(prev => prev.filter(b => b.id !== id));
      setFeedback({ type: 'neutral', message: 'Bloque eliminado.' });
    },
    [isFinished]
  );

  const handleReset = () => {
    setCanvasBlocks([]);
    setFeedback({
      type: 'neutral',
      message: 'Lienzo limpio. ¡Empieza de nuevo!'
    });
    setElapsedSeconds(0);
    setPenalties(0);
    setIsFinished(false);
  };

  /* =======================
     SIMULACIÓN
  ======================= */
  const runSimulation = () => {
    if (isFinished) return;

    if (canvasBlocks.length === 0) {
      setFeedback({
        type: 'error',
        message: 'El flujo está vacío. Arrastra bloques para empezar.'
      });
      return;
    }

    let error:
      | { condicion?: string; mensaje: string }
      | undefined;

    if (canvasBlocks[0].nombre !== 'Disparador') {
      error =
        GAME_DATA.feedback.errores.find(
          e => e.condicion === 'inicio_incorrecto'
        ) || { mensaje: 'Error de inicio' };
    }

    if (!error && canvasBlocks.some(b => b.tipo === 'Distractor')) {
      error =
        GAME_DATA.feedback.errores.find(
          e => e.condicion === 'uso_distractor'
        ) || { mensaje: 'Bloque innecesario detectado' };
    }

    if (!error) {
      const currentOrderNames = canvasBlocks.map(b => b.nombre);
      const isCorrect =
        JSON.stringify(currentOrderNames) ===
        JSON.stringify(CORRECT_ORDER);

      if (isCorrect) {
        const finalScore = Math.max(
          0,
          SCORING.INITIAL_SCORE -
            elapsedSeconds * SCORING.TIME_PENALTY -
            penalties
        );

        setIsFinished(true);
        setFeedback({
          type: 'success',
          message: `✅ ¡Misión Completada! Puntuación Final: ${finalScore}`,
          subMessage: GAME_DATA.feedback.exito.cliente_dice
        });

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        return;
      } else {
        error = {
          mensaje: 'El flujo no está completo o el orden no es exacto.'
        };
      }
    }

    setPenalties(p => p + SCORING.ERROR_PENALTY);
    setFeedback({
      type: 'error',
      message: error?.mensaje || 'Error desconocido'
    });
  };

  /* =======================
     UI HELPERS
  ======================= */
  const getFeedbackStyles = () => {
    switch (feedback.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-white border-slate-200 text-slate-600';
    }
  };

  const getFeedbackIcon = () => {
    switch (feedback.type) {
      case 'success':
        return <Trophy className="text-yellow-500" />;
      case 'error':
        return <XCircle className="text-red-500" />;
      default:
        return <AlertTriangle className="text-slate-400" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        <Assistant />

        <div className="flex-1 flex flex-col min-w-0">
          <div
            className={`p-4 border-b shadow-sm flex justify-between ${getFeedbackStyles()}`}
          >
            <div className="flex gap-2 items-start">
              {getFeedbackIcon()}
              <p>{feedback.message}</p>
            </div>

            <div className="flex gap-4 items-center">
  <span className="font-mono text-sm flex items-center gap-1">
    <Trophy size={14} className="text-yellow-500" />
    {currentScore} pts
  </span>

  <span className="font-mono text-sm flex items-center gap-1">
    <Timer size={14} />
    {formatTime(elapsedSeconds)}
  </span>

  <button onClick={handleReset}>
    <RotateCcw size={18} />
  </button>
              {!isFinished && (
                <button
                  onClick={runSimulation}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <Play size={14} />
                  Ejecutar
                </button>
              )}
            </div>
          </div>

          <Canvas
            blocks={canvasBlocks}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onReorder={() => {}}
          />
        </div>

        <div className="hidden lg:block">
  <Palette availableBlocks={initialBlocks} />
</div>
      </div>
    </div>
  );
};

export default App;
