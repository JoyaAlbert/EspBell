// Configuración global para la aplicación Electron
const path = require('path');

// Rutas principales
const APP_ROOT = path.join(__dirname, '..', '..');
const RENDERER_PATH = path.join(APP_ROOT, 'src', 'renderer');
const PUBLIC_PATH = path.join(APP_ROOT, 'public');

// Configuración de la ventana principal
const MAIN_WINDOW_CONFIG = {
  width: 860,
  height: 680,
  minWidth: 700,
  minHeight: 500,
  backgroundColor: '#f5f5f7',
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  },
  show: false, // No mostrar hasta que esté listo para evitar parpadeo
  frame: true, // Usar marco estándar en todas las plataformas
  transparent: false, // Sin transparencia para consistencia
  autoHideMenuBar: true, // Ocultar la barra de menú automáticamente
  icon: path.join(PUBLIC_PATH, 'icon.png') // Icono consistente para todas las plataformas
};

// Configuración MQTT por defecto
const DEFAULT_MQTT_CONFIG = {
  broker: 'mqtt://192.168.1.210:1883', // IP del ESP32 broker MQTT
  clientId: 'espbell_app_' + Math.random().toString(16).substr(2, 8),
  subscribeTopics: ['espbell/commands']
};

module.exports = {
  APP_ROOT,
  RENDERER_PATH,
  PUBLIC_PATH,
  MAIN_WINDOW_CONFIG,
  DEFAULT_MQTT_CONFIG
};
