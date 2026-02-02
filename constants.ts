import { GameConfig } from './types';

export const GAME_DATA: GameConfig = {
  juego: {
    nombre: "La Búsqueda del Automatizador",
    version: "1.0"
  },
  mision: {
    id: "M1",
    titulo: "El Flujo Perdido",
    descripcion: "El cliente reporta que, cuando alguien completa un formulario con archivo adjunto, el contenido no se guarda en Google Drive. ¿Qué falta en el flujo?",
    objetivo_jugador: "Reconstruir el flujo correcto arrastrando los bloques en el orden adecuado."
  },
  bloques_disponibles: {
    correctos: [
      { id: 'b1', nombre: "Disparador", tipo: "Trigger", descripcion: "Inicia el flujo." },
      { id: 'b2', nombre: "Webhook", tipo: "Fuente de datos", descripcion: "Recibe datos externos." },
      { id: 'b3', nombre: "¿Tiene archivo?", tipo: "Condición", descripcion: "Verifica si llegó un archivo." },
      { id: 'b4', nombre: "Guardar en Google Drive", tipo: "Acción", descripcion: "Guarda el archivo en la nube." },
      { id: 'b5', nombre: "Finalizar Flujo", tipo: "Control", descripcion: "Cierra el flujo correctamente." }
    ],
    distractores: [
      { id: 'd1', nombre: "Esperar 10 segundos", tipo: "Distractor" },
      { id: 'd2', nombre: "Enviar mensaje a Slack", tipo: "Distractor" }
    ]
  },
  interfaz_usuario: {
    colores_por_tipo: {
      "Trigger": "#a259ff",
      "Fuente de datos": "#3b82f6",
      "Condición": "#facc15",
      "Acción": "#10b981",
      "Control": "#6b7280",
      "Distractor": "#f97316"
    }
  },
  feedback: {
    errores: [
      { condicion: "inicio_incorrecto", mensaje: "⚠️ ¿Agregaste un Disparador al principio del flujo?" },
      { condicion: "condicion_antes_de_datos", mensaje: "📥 No podés verificar antes de recibir datos." },
      { condicion: "accion_sin_condicion", mensaje: "📂 Estás guardando sin chequear si hay archivo." },
      { condicion: "uso_distractor", mensaje: "⏱️ Ese bloque no es necesario en esta misión." }
    ],
    exito: {
      mensaje: "✅ ¡Flujo restaurado! Ahora los archivos se guardan en Drive automáticamente.",
      cliente_dice: "‘¡Gracias, Reparador/a! Volvió a funcionar.’"
    }
  },
  asistente_virtual: {
    nombre: "Auto",
    rol: "Guía digital",
    mensaje_bienvenida: "Hola, soy Auto. Te voy a ayudar a reparar este flujo defectuoso.",
    pistas: [
      "Todo flujo empieza con un Disparador.",
      "No se puede guardar si no recibiste nada.",
      "¿Chequeaste si hay archivo antes de guardarlo?"
    ]
  }
};

export const CORRECT_ORDER = [
  "Disparador",
  "Webhook",
  "¿Tiene archivo?",
  "Guardar en Google Drive",
  "Finalizar Flujo"
];

export const SCORING = {
  INITIAL_SCORE: 1000,
  TIME_PENALTY: 2, // Points per second
  ERROR_PENALTY: 50, // Points per failed run
  DISTRACTOR_PENALTY: 30 // Points per distractor drop
};

export const COLORS = {
  background: "#fdfdfc",
  grid: "#e2e8f0"
};