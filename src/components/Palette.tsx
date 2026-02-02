import React from 'react';
import { BlockDef } from '../types';
import { Block } from './Block';
import { GAME_DATA } from '../constants';
import { Layers } from 'lucide-react';

interface PaletteProps {
  availableBlocks: BlockDef[];
}

export const Palette: React.FC<PaletteProps> = ({ availableBlocks }) => {
  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full shadow-sm z-20">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Layers size={20} className="text-slate-500" />
        <h2 className="font-bold text-slate-800">Componentes</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-slate-500 mb-4 px-1">
          Arrastra los bloques al área central para construir tu automatización.
        </p>
        
        {availableBlocks.map(block => (
  <div
    key={block.id}
    draggable
    onDragStart={(e) => {
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify(block)
      );
      e.dataTransfer.effectAllowed = 'move';
    }}
  >
    <Block 
      block={block}
      color={GAME_DATA.interfaz_usuario.colores_por_tipo[block.tipo]}
      compact={true}
    />
  </div>
))}
        <div className="mt-8 pt-6 border-t border-slate-100">
           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 px-1">Leyenda</p>
           <div className="grid grid-cols-2 gap-2">
              {Object.entries(GAME_DATA.interfaz_usuario.colores_por_tipo).map(([tipo, color]) => (
                <div key={tipo} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                  <span className="text-[10px] text-slate-500 truncate">{tipo}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
