// Archivo principal del proceso de Electron
const { app, BrowserWindow, ipcMain, Menu, nativeTheme } = require('electron');
const path = require('path');
const { MAIN_WINDOW_CONFIG, RENDERER_PATH } = require('./config');
const mqttManager = require('./mqtt-manager');

// Mantener una referencia global del objeto window
// para evitar que la ventana se cierre automáticamente 
// cuando el objeto JavaScript es basura recolectada.
let mainWindow;

function createWindow() {
  // Crear la ventana del navegador.
  mainWindow = new BrowserWindow(MAIN_WINDOW_CONFIG);

  // Cargar el archivo index.html de la aplicación.
  mainWindow.loadFile(path.join(RENDERER_PATH, 'index.html'));

  // Quitar la barra de menú
  mainWindow.setMenuBarVisibility(false);

  // Crear un menú básico para todas las plataformas
  const template = [
    {
      label: 'Archivo',
      submenu: [
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar recarga' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Restablecer zoom' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  // Mostrar la ventana cuando el contenido está listo para evitar parpadeos
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Efecto de aparición suave para todas las plataformas
    mainWindow.setOpacity(0);
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.1;
      if (opacity >= 1) {
        opacity = 1;
        clearInterval(fadeIn);
      }
      mainWindow.setOpacity(opacity);
    }, 10);
  });

  // Abre las herramientas de desarrollo (DevTools) si descomentas la siguiente línea
  // mainWindow.webContents.openDevTools();

  // Emitido cuando la ventana es cerrada.
  mainWindow.on('closed', function () {
    // Elimina la referencia al objeto window
    mainWindow = null;
    
    // Desconectar el cliente MQTT si existe
    mqttManager.disconnect();
  });
}

// Este método será llamado cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
// Algunas APIs pueden usarse sólo después de que este evento ocurra.
app.whenReady().then(() => {
  createWindow();
  
  // Configurar detector de cambio de tema (claro/oscuro)
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      mainWindow.webContents.send('theme-changed', { isDarkMode });
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on('window-all-closed', function () {
  app.quit();
});

app.on('activate', function () {
  // Recrear la ventana si no existe cuando se activa la aplicación
  if (mainWindow === null) createWindow();
});

// Configurar manejadores de IPC para interactuar con el renderer
ipcMain.on('mqtt-connect', (event, brokerInfo) => {
  try {
    const client = mqttManager.connect(brokerInfo);
    
    // Configurar manejadores de eventos para comunicación con el renderer
    client.on('connect', () => {
      if (mainWindow) {
        mainWindow.webContents.send('mqtt-status', 'connected');
      }
    });
    
    client.on('message', (topic, message) => {
      if (mainWindow) {
        mainWindow.webContents.send('mqtt-message', {
          topic: topic,
          message: message.toString()
        });
      }
    });
    
    client.on('error', (err) => {
      if (mainWindow) {
        mainWindow.webContents.send('mqtt-status', 'error', err.message);
      }
    });
    
    client.on('reconnect', () => {
      if (mainWindow) {
        mainWindow.webContents.send('mqtt-status', 'reconnecting');
      }
    });
    
    client.on('close', () => {
      if (mainWindow) {
        mainWindow.webContents.send('mqtt-status', 'disconnected');
      }
    });
  } catch (error) {
    console.error('Error al conectar al broker MQTT:', error);
    if (mainWindow) {
      mainWindow.webContents.send('mqtt-status', 'error', error.message);
    }
  }
});

ipcMain.on('mqtt-disconnect', () => {
  mqttManager.disconnect();
});

ipcMain.on('mqtt-publish', (event, data) => {
  try {
    mqttManager.publish(data.topic, data.message)
      .then(result => {
        console.log(`Mensaje publicado en ${result.topic}`);
      })
      .catch(err => {
        console.error('Error al publicar mensaje:', err);
        if (mainWindow) {
          mainWindow.webContents.send('mqtt-status', 'error', err.message);
        }
      });
  } catch (error) {
    console.error('Error al publicar mensaje:', error);
    if (mainWindow) {
      mainWindow.webContents.send('mqtt-status', 'error', error.message);
    }
  }
});

ipcMain.on('mqtt-subscribe', (event, topic) => {
  try {
    mqttManager.subscribe(topic)
      .then(subscribedTopic => {
        console.log(`Suscrito a ${subscribedTopic}`);
      })
      .catch(err => {
        console.error(`Error al suscribirse a ${topic}:`, err);
        if (mainWindow) {
          mainWindow.webContents.send('mqtt-status', 'error', err.message);
        }
      });
  } catch (error) {
    console.error(`Error al suscribirse a ${topic}:`, error);
    if (mainWindow) {
      mainWindow.webContents.send('mqtt-status', 'error', error.message);
    }
  }
});
