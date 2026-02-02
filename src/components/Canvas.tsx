import React from 'react';
import { BlockDef } from '../types';
import { Block } from './Block';
import { Trash2, ArrowDown } from 'lucide-react';
import { GAME_DATA, COLORS } from '../constants';

interface CanvasProps {
  blocks: BlockDef[];
  onDrop: (block: BlockDef, index?: number) => void;
  onRemove: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ blocks, onDrop, onRemove }) => {
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const block = JSON.parse(data) as BlockDef;
        onDrop(block, index);
      }
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundColor: COLORS.background,
          backgroundImage: `radial-gradient(${COLORS.grid} 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

     <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto min-h-[400px] flex flex-col pb-32 px-2">
          
          {/* Start Indicator */}
          <div className="flex justify-center mb-4 opacity-50">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400">Inicio</div>
          </div>

          {/* Drop Zones and Blocks */}
          <div className="flex flex-col gap-0">
            {/* Initial Drop Zone (if empty) */}
            {blocks.length === 0 && (
              <div 
                onDragOver={(e) => handleDragOver(e, 0)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 0)}
                className={`
                  h-40 border-2 border-dashed rounded-xl flex items-center justify-center
                  text-slate-400 transition-colors
                  ${dragOverIndex === 0 ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
                `}
              >
                <div className="text-center">
                  <p className="font-medium">Arrastra bloques aquí</p>
                  <p className="text-sm opacity-70">Construye tu flujo de automatización</p>
                </div>
              </div>
            )}

            {blocks.map((block, index) => (
              <React.Fragment key={block.id}>
                 {/* Connection Line */}
                 {index > 0 && (
                  <div className="h-6 w-0.5 bg-slate-300 mx-auto my-1 relative">
                    <ArrowDown className="absolute -bottom-1 -left-1.5 text-slate-300 w-4 h-4" />
                  </div>
                )}

                {/* Drop Zone Before Block (for reordering) */}
                <div 
                  className={`h-2 transition-all duration-200 rounded-full my-1 ${dragOverIndex === index ? 'bg-blue-400 h-6 scale-100' : 'bg-transparent scale-0'}`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                />

                <div className="relative group">
                  <Block 
                    block={block} 
                    color={GAME_DATA.interfaz_usuario.colores_por_tipo[block.tipo]}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('source_index', index.toString());
                    }}
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemove(block.id)}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </React.Fragment>
            ))}

             {/* Final Drop Zone */}
             {blocks.length > 0 && (
               <>
                 <div className="h-6 w-0.5 bg-slate-300 mx-auto my-1 relative">
                    <ArrowDown className="absolute -bottom-1 -left-1.5 text-slate-300 w-4 h-4" />
                 </div>
                 <div 
                  className={`
                    h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-300
                    transition-colors mt-1
                    ${dragOverIndex === blocks.length ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
                  `}
                  onDragOver={(e) => handleDragOver(e, blocks.length)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, blocks.length)}
                >
                  <span className="text-sm">Fin del flujo o siguiente paso</span>
                </div>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
