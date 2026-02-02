import React, {
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { BlockDef, FeedbackState } from './types';
import { GAME_DATA, CORRECT_ORDER, SCORING } from './constants';
import { Assistant } from './components/Assistant';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { Block } from './components/Block';
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
   UTIL: SHUFFLE BLOQUES
======================= */
const shuffle = <T,>(array: T[]) =>
  [...array].sort(() => Math.random() - 0.5);

const App: React.FC = () => {
  /* =======================
     BLOQUES DESORDENADOS
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
    const interval = window.setInterval(
      () => setElapsedSeconds(prev => prev + 1),
      1000
    );
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentScore = Math.max(
    0,
    SCORING.INITIAL_SCORE -
      elapsedSeconds * SCORING.TIME_PENALTY -
      penalties
  );

  /* =======================
     DROP / ADD BLOCK
  ======================= */
  const handleDrop = useCallback(
    (block: BlockDef, index?: number) => {
      if (isFinished) return;

      setCanvasBlocks(prev => {
        const next = [...prev];
        const insertIndex =
          index !== undefined
            ? Math.min(index, next.length)
            : next.length;

        next.splice(insertIndex, 0, {
          ...block,
          id: crypto.randomUUID()
        });

        return next;
      });

      if (block.tipo === 'Distractor') {
        setPenalties(p => p + SCORING.DISTRACTOR_PENALTY);
        setFeedback({
          type: 'error',
          message: `⚠️ Bloque incorrecto. -${SCORING.DISTRACTOR_PENALTY} pts`
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
      setFeedback({
        type: 'neutral',
        message: 'Bloque eliminado.'
      });
    },
    [isFinished]
  );

  const handleReset = () => {
    setCanvasBlocks([]);
    setElapsedSeconds(0);
    setPenalties(0);
    setIsFinished(false);
    setFeedback({
      type: 'neutral',
      message: 'Lienzo limpio. ¡Empieza de nuevo!'
    });
  };

  /* =======================
     SIMULACIÓN
  ======================= */
  const runSimulation = () => {
    if (isFinished) return;

    if (canvasBlocks.length === 0) {
      setFeedback({
        type: 'error',
        message: 'El flujo está vacío.'
      });
      return;
    }

    let error:
      | { mensaje: string }
      | undefined;

    if (canvasBlocks[0].nombre !== 'Disparador') {
      error = { mensaje: 'El flujo no inicia con un Disparador.' };
    }

    if (!error && canvasBlocks.some(b => b.tipo === 'Distractor')) {
      error = { mensaje: 'Hay bloques innecesarios en el flujo.' };
    }

    if (!error) {
      const names = canvasBlocks.map(b => b.nombre);
      const isCorrect =
        JSON.stringify(names) === JSON.stringify(CORRECT_ORDER);

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
          message: `✅ ¡Misión completada! Puntuación: ${finalScore}`,
          subMessage: GAME_DATA.feedback.exito.cliente_dice
        });

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
        return;
      } else {
        error = { mensaje: 'El orden no es correcto.' };
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
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="flex flex-col h-screen bg-slate-100 pb-28">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Assistant solo desktop */}
        <div className="hidden lg:block">
          <Assistant />
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b bg-white shadow-sm flex justify-between items-center">
            <div className="flex items-start gap-2">
              {getFeedbackIcon()}
              <p className="text-sm">{feedback.message}</p>
            </div>

            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="flex items-center gap-1">
                <Trophy size={14} /> {currentScore}
              </span>
              <span className="flex items-center gap-1">
                <Timer size={14} /> {formatTime(elapsedSeconds)}
              </span>

              <button onClick={handleReset}>
                <RotateCcw size={18} />
              </button>

              {!isFinished && (
                <button
                  onClick={runSimulation}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1"
                >
                  <Play size={14} /> Ejecutar
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

        {/* Palette desktop */}
        <div className="hidden lg:block">
          <Palette availableBlocks={initialBlocks} />
        </div>
      </div>

      {/* =======================
          PALETTE MOBILE
      ======================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex gap-3 overflow-x-auto p-3">
          {initialBlocks.map(block => (
            <div
              key={block.id}
              className="min-w-[160px]"
              onClick={() => handleDrop(block)}
            >
              <Block
                block={block}
                color={
                  GAME_DATA.interfaz_usuario.colores_por_tipo[block.tipo]
                }
                compact
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
