// Configuración global para la aplicación Electron
const path = require('path');

// Rutas principales
const APP_ROOT = path.join(__dirname, '..', '..');
const RENDERER_PATH = path.join(APP_ROOT, 'src', 'renderer');
const PUBLIC_PATH = path.join(APP_ROOT, 'public');

// Configuración de la ventana principal
const MAIN_WINDOW_CONFIG = {
  width: 800,
  height: 600,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false
  }
};

// Configuración MQTT por defecto
const DEFAULT_MQTT_CONFIG = {
  broker: 'mqtt://broker.emqx.io:1883',
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
