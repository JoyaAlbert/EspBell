// Preload script para Electron
// Este archivo actúa como puente entre el proceso principal y el renderizador
// permitiendo exponer APIs seguras al contexto de renderizado

const { contextBridge, ipcRenderer } = require('electron');

// Exponer una API protegida para que el renderizador pueda usar
contextBridge.exposeInMainWorld('mqttAPI', {
  // Métodos para enviar mensajes al proceso principal
  disconnect: () => ipcRenderer.send('mqtt-disconnect'),
  publish: (data) => ipcRenderer.send('mqtt-publish', data),
  
  // Eventos que pueden ser escuchados por el renderizador
  onMessage: (callback) => ipcRenderer.on('mqtt-message', (event, data) => callback(data)),
  onStatusChange: (callback) => ipcRenderer.on('mqtt-status', (event, status, message) => callback(status, message)),
  onDoorbellAlert: (callback) => ipcRenderer.on('doorbell-alert', (event, message) => callback(message)),
  
  // Limpiar los listeners al cerrar la ventana para evitar fugas de memoria
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('mqtt-message');
    ipcRenderer.removeAllListeners('mqtt-status');
    ipcRenderer.removeAllListeners('doorbell-alert');
  }
});

// También puedes exponer variables del entorno o información del sistema
contextBridge.exposeInMainWorld('electronInfo', {
  appVersion: process.env.npm_package_version || 'desconocida',
  platform: process.platform
});

// Exponer API para tema claro/oscuro
contextBridge.exposeInMainWorld('themeAPI', {
  // Escuchar cambios de tema del sistema
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', (event, themeData) => callback(themeData)),
  
  // Establecer tema manualmente
  setTheme: (isDarkMode) => ipcRenderer.send('set-theme', isDarkMode),
  
  // Método para limpiar los listeners
  removeThemeListeners: () => {
    ipcRenderer.removeAllListeners('theme-changed');
  }
});
