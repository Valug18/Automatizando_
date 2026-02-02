import React from 'react';
import { BlockDef } from '../types';
import { GripVertical } from 'lucide-react';

interface BlockProps {
  block: BlockDef;
  color: string;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, block: BlockDef) => void;
  onClick?: () => void;
  compact?: boolean;
}

export const Block: React.FC<BlockProps> = ({ 
  block, 
  color, 
  isDraggable = true, 
  onDragStart,
  compact = false,
  onClick
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (onDragStart) {
      e.dataTransfer.effectAllowed = 'copyMove';
      e.dataTransfer.setData('application/json', JSON.stringify(block));
      onDragStart(e, block);
    }
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`
        relative group flex items-center gap-3 p-3 rounded-lg border-2 shadow-sm 
        bg-white cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:-translate-y-0.5
        select-none
      `}
      style={{ borderColor: color }}
    >
      <div 
        className="flex items-center justify-center w-8 h-8 rounded-md text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        <GripVertical size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-800 truncate leading-tight">
          {block.nombre}
        </h4>
        {!compact && block.descripcion && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {block.descripcion}
          </p>
        )}
      </div>

      <div 
        className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider opacity-60"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {block.tipo}
      </div>
    </div>
  );
};