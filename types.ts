export type BlockType = 'Trigger' | 'Fuente de datos' | 'Condición' | 'Acción' | 'Control' | 'Distractor';

export interface BlockDef {
  id: string; // Unique ID for drag and drop tracking
  nombre: string;
  tipo: BlockType;
  descripcion?: string;
}

export interface GameConfig {
  juego: {
    nombre: string;
    version: string;
  };
  mision: {
    id: string;
    titulo: string;
    descripcion: string;
    objetivo_jugador: string;
  };
  bloques_disponibles: {
    correctos: BlockDef[];
    distractores: BlockDef[];
  };
  interfaz_usuario: {
    colores_por_tipo: Record<string, string>;
  };
  feedback: {
    errores: Array<{ condicion: string; mensaje: string }>;
    exito: {
      mensaje: string;
      cliente_dice: string;
    };
  };
  asistente_virtual: {
    nombre: string;
    rol: string;
    mensaje_bienvenida: string;
    pistas: string[];
  };
}

export interface FeedbackState {
  type: 'neutral' | 'error' | 'success';
  message: string;
  subMessage?: string;
}