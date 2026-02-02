import React from 'react';
import { Bot, Lightbulb, BookOpen } from 'lucide-react';
import { GAME_DATA } from '../constants';

export const Assistant: React.FC = () => {
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-20 hidden lg:flex">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{GAME_DATA.asistente_virtual.nombre}</h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{GAME_DATA.asistente_virtual.rol}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 italic">
          "{GAME_DATA.asistente_virtual.mensaje_bienvenida}"
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Mission Info */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
            <BookOpen size={18} className="text-indigo-500" />
            <h3>Misión: {GAME_DATA.mision.id}</h3>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
            <p className="font-semibold mb-1">{GAME_DATA.mision.titulo}</p>
            <p>{GAME_DATA.mision.descripcion}</p>
          </div>
        </section>

        {/* Tips */}
        <section>
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
            <Lightbulb size={18} className="text-yellow-500" />
            <h3>Pistas</h3>
          </div>
          <ul className="space-y-3">
            {GAME_DATA.asistente_virtual.pistas.map((pista, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                <span className="text-indigo-400 font-mono font-bold">{idx + 1}.</span>
                {pista}
              </li>
            ))}
          </ul>
        </section>

         {/* Concepts (Simulated based on context) */}
         <section>
          <h3 className="font-bold text-slate-800 mb-3">Conceptos Clave</h3>
          <div className="space-y-2 text-xs text-slate-500">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span>Trigger</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded">Inicia</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span>Acción</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded">Ejecuta</span>
            </div>
             <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span>Condición</span>
              <span className="bg-slate-100 px-1.5 py-0.5 rounded">Decide</span>
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400">v{GAME_DATA.juego.version}</p>
      </div>
    </div>
  );
};