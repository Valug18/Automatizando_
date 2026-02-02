import React, { useState, useCallback, useEffect } from 'react';
import { BlockDef, FeedbackState } from './types';
import { GAME_DATA, CORRECT_ORDER, SCORING } from './constants';
import { Assistant } from './components/Assistant';
import { Palette } from './components/Palette';
import { Canvas } from './components/Canvas';
import { Block } from './components/Block';
import { Play, RotateCcw, AlertTriangle, XCircle, Menu, Timer, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const initialBlocks = [
    ...GAME_DATA.bloques_disponibles.correctos,
    ...GAME_DATA.bloques_disponibles.distractores
  ];

  const [canvasBlocks, setCanvasBlocks] = useState<BlockDef[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'neutral', message: GAME_DATA.mision.descripcion });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: number;
    if (!isFinished) {
      interval = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFinished]);

  const currentScore = Math.max(0, SCORING.INITIAL_SCORE - (elapsedSeconds * SCORING.TIME_PENALTY) - penalties);

  const handleDrop = useCallback((block: BlockDef, index?: number) => {
    if (isFinished) return;

    setCanvasBlocks(prev => {
      const existingIndex = prev.findIndex(b => b.id === block.id);
      let newBlocks = [...prev];

      if (existingIndex >= 0) {
        newBlocks.splice(existingIndex, 1);
      }

      const insertIndex = (index !== undefined && index !== null) 
        ? (index > newBlocks.length ? newBlocks.length : index) 
        : newBlocks.length;

      newBlocks.splice(insertIndex, 0, block);
      
      return newBlocks;
    });

    const isNewDrop = !canvasBlocks.some(b => b.id === block.id);
    if (isNewDrop && block.tipo === 'Distractor') {
      setPenalties(prev => prev + SCORING.DISTRACTOR_PENALTY);
      setFeedback({ 
        type: 'error', 
        message: `⚠️ Bloque incorrecto detectado. -${SCORING.DISTRACTOR_PENALTY} pts` 
      });
    } else {
      setFeedback({ type: 'neutral', message: "Editando flujo..." });
    }

  }, [canvasBlocks, isFinished]);

  const handleRemove = useCallback((id: string) => {
    if (isFinished) return;
    setCanvasBlocks(prev => prev.filter(b => b.id !== id));
    setFeedback({ type: 'neutral', message: "Bloque eliminado." });
  }, [isFinished]);

  const handleReset = () => {
    setCanvasBlocks([]);
    setFeedback({ type: 'neutral', message: "Lienzo limpio. ¡Empieza de nuevo!" });
    setElapsedSeconds(0);
    setPenalties(0);
    setIsFinished(false);
  };

  const runSimulation = () => {
    if (isFinished) return;

    if (canvasBlocks.length === 0) {
      setFeedback({ type: 'error', message: "El flujo está vacío. Arrastra bloques para empezar." });
      return;
    }

    let error: { condicion?: string, mensaje: string } | undefined;

    if (canvasBlocks[0].nombre !== 'Disparador') {
      error = GAME_DATA.feedback.errores.find(e => e.condicion === 'inicio_incorrecto');
      if (!error) error = { mensaje: "Error de inicio" };
    }

    if (!error && canvasBlocks.some(b => b.tipo === 'Distractor')) {
      error = GAME_DATA.feedback.errores.find(e => e.condicion === 'uso_distractor');
      if (!error) error = { mensaje: "Bloque innecesario detectado" };
    }

    if (!error) {
      const webhookIdx = canvasBlocks.findIndex(b => b.nombre === 'Webhook');
      const conditionIdx = canvasBlocks.findIndex(b => b.nombre === '¿Tiene archivo?');
      const actionIdx = canvasBlocks.findIndex(b => b.nombre === 'Guardar en Google Drive');

      if (conditionIdx >= 0 && webhookIdx >= 0 && conditionIdx < webhookIdx) {
         error = GAME_DATA.feedback.errores.find(e => e.condicion === 'condicion_antes_de_datos');
      } else if (conditionIdx >= 0 && webhookIdx === -1) {
         error = { mensaje: "Estás verificando un archivo, pero no hay fuente de datos (Webhook)." };
      } else if (actionIdx >= 0) {
        if (conditionIdx === -1 || actionIdx < conditionIdx) {
          error = GAME_DATA.feedback.errores.find(e => e.condicion === 'accion_sin_condicion');
        }
      }
    }

    if (!error) {
      const currentOrderNames = canvasBlocks.map(b => b.nombre);
      const isCorrect = JSON.stringify(currentOrderNames) === JSON.stringify(CORRECT_ORDER);

      if (isCorrect) {
        const finalScore = Math.max(0, SCORING.INITIAL_SCORE - (elapsedSeconds * SCORING.TIME_PENALTY) - penalties);
        setIsFinished(true);
        setFeedback({ 
          type: 'success', 
          message: `✅ ¡Misión Completada! Puntuación Final: ${finalScore}`,
          subMessage: GAME_DATA.feedback.exito.cliente_dice
        });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#a259ff', '#3b82f6', '#10b981']
        });
        return;
      } else {
        error = { mensaje: "El flujo no está completo o el orden no es exacto. Revisa las pistas." };
      }
    }

    setPenalties(p => p + SCORING.ERROR_PENALTY);
    setFeedback({ 
      type: 'error', 
      message: error?.mensaje || "Error desconocido",
      subMessage: `Penalización aplicada: -${SCORING.ERROR_PENALTY} pts`
    });
  };

  const getFeedbackStyles = () => {
    switch(feedback.type) {
      case 'success': return "bg-green-50 border-green-200 text-green-800";
      case 'error': return "bg-red-50 border-red-200 text-red-800";
      default: return "bg-white border-slate-200 text-slate-600";
    }
  };

  const getFeedbackIcon = () => {
     switch(feedback.type) {
      case 'success': return <Trophy className="text-yellow-500" />;
      case 'error': return <XCircle className="text-red-500" />;
      default: return <AlertTriangle className="text-slate-400" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <div className="lg:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-30">
        <h1 className="font-bold text-slate-800 truncate mr-2">Búsqueda del Automatizador</h1>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                <Timer size={14} /> {formatTime(elapsedSeconds)}
            </div>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 bg-slate-100 rounded">
            <Menu size={20} />
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`${showMobileMenu ? 'absolute inset-0 z-40 flex' : 'hidden'} lg:relative lg:flex`}>
            <Assistant />
            {showMobileMenu && <div className="flex-1 bg-black/50 lg:hidden" onClick={() => setShowMobileMenu(false)} />}
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative z-0">
          <div className={`p-4 border-b border-slate-200 shadow-sm z-10 flex flex-col gap-4 transition-colors ${getFeedbackStyles()}`}>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 shrink-0">{getFeedbackIcon()}</div>
                <div>
                    <p className="font-medium text-sm sm:text-base">{feedback.message}</p>
                    {feedback.subMessage && <p className="text-xs sm:text-sm opacity-80 mt-1 italic">"{feedback.subMessage}"</p>}
                </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <div className="flex items-center gap-4 text-sm bg-white/50 p-2 rounded-lg border border-black/5">
                         <div className={`flex items-center gap-1.5 font-mono font-bold ${currentScore < 500 ? 'text-red-500' : 'text-slate-700'}`}>
                            <Trophy size={16} className="text-yellow-500" />
                            {currentScore} pts
                        </div>
                        <div className="w-px h-4 bg-slate-300"></div>
                        <div className="flex items-center gap-1.5 font-mono text-slate-600">
                            <Timer size={16} />
                            {formatTime(elapsedSeconds)}
                        </div>
                    </div>

                    <button 
                        onClick={handleReset}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-black/5 rounded-lg transition-colors"
                        title="Reiniciar Misión"
                    >
                        <RotateCcw size={18} />
                    </button>
                    
                    {!isFinished && (
                        <button 
                            onClick={runSimulation}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Play size={16} fill="currentColor" />
                            Ejecutar
                        </button>
                    )}
                </div>
            </div>
          </div>

          <Canvas 
            blocks={canvasBlocks} 
            onDrop={handleDrop} 
            onRemove={handleRemove}
            onReorder={() => {}} 
          />
        
        </div>

        <div className="hidden lg:flex">
          <Palette availableBlocks={initialBlocks} />
        </div>

      </div>

      <div className="lg:hidden h-24 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2 px-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        {initialBlocks.map(block => (
           <div key={block.id} className="min-w-[140px]">
              <Block 
                block={block}
                color={GAME_DATA.interfaz_usuario.colores_por_tipo[block.tipo]}
                compact={true}
                onDragStart={() => {}}
                onClick={() => handleDrop(block)} 
              />
           </div>
        ))}
      </div>
    </div>
  );
};

export default App;