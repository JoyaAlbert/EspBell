// Preload script para Electron
// Este archivo actúa como puente entre el proceso principal y el renderizador
// permitiendo exponer APIs seguras al contexto de renderizado

const { contextBridge, ipcRenderer } = require('electron');

// Exponer una API protegida para que el renderizador pueda usar
contextBridge.exposeInMainWorld('mqttAPI', {
  // Métodos para enviar mensajes al proceso principal
  connect: (brokerInfo) => ipcRenderer.send('mqtt-connect', brokerInfo),
  disconnect: () => ipcRenderer.send('mqtt-disconnect'),
  publish: (data) => ipcRenderer.send('mqtt-publish', data),
  subscribe: (topic) => ipcRenderer.send('mqtt-subscribe', topic),
  
  // Eventos que pueden ser escuchados por el renderizador
  onMessage: (callback) => ipcRenderer.on('mqtt-message', (event, data) => callback(data)),
  onStatusChange: (callback) => ipcRenderer.on('mqtt-status', (event, status, message) => callback(status, message)),
  
  // Limpiar los listeners al cerrar la ventana para evitar fugas de memoria
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('mqtt-message');
    ipcRenderer.removeAllListeners('mqtt-status');
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
  
  // Método para limpiar los listeners
  removeThemeListeners: () => {
    ipcRenderer.removeAllListeners('theme-changed');
  }
});
