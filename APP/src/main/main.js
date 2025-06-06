// Archivo principal del proceso de Electron
const { app, BrowserWindow, ipcMain, Menu, nativeTheme } = require('electron');
const path = require('path');
const { MAIN_WINDOW_CONFIG, RENDERER_PATH } = require('./config');
const mqttManager = require('./mqtt-manager');

// Manejo del inicio automático en Windows
if (require('electron-squirrel-startup')) app.quit();

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
  
  // Conectar automáticamente al broker MQTT en el ESP32
  setTimeout(() => {
    try {
      console.log('Conectando automáticamente al broker MQTT local (ESP32)...');
      const client = mqttManager.connect(); // Usará la configuración por defecto (ESP32)
      
      client.on('connect', () => {
        console.log('✅ Conectado al broker MQTT local (ESP32)');
        if (mainWindow) {
          mainWindow.webContents.send('mqtt-status', 'connected');
          
          // Suscribirse automáticamente al topic del timbre
          mqttManager.subscribe('casa/timbre')
            .then(subscribedTopic => {
              console.log(`Suscrito a ${subscribedTopic}`);
            })
            .catch(err => {
              console.error(`Error al suscribirse a casa/timbre:`, err);
            });
        }
      });
      
      client.on('message', (topic, message) => {
        if (mainWindow) {
          mainWindow.webContents.send('mqtt-message', {
            topic: topic,
            message: message.toString()
          });
          
          // Si el mensaje es del topic del timbre, enviar un evento especial y mostrar la ventana
          if (topic === 'casa/timbre') {
            mainWindow.webContents.send('doorbell-alert', message.toString());
            
            // Mostrar y enfocar la ventana
            if (!mainWindow.isVisible()) {
              mainWindow.show();
            }
            if (!mainWindow.isFocused()) {
              mainWindow.focus();
            }
            // En algunos sistemas operativos, forzar que la ventana esté en primer plano
            mainWindow.setAlwaysOnTop(true);
            // Después de un breve momento, desactivar always on top
            setTimeout(() => {
              mainWindow.setAlwaysOnTop(false);
            }, 3000);
          }
        }
      });
      
      client.on('error', (err) => {
        console.error('❌ Error al conectar al broker MQTT local:', err.message);
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
      console.error('Error al iniciar conexión MQTT:', error);
    }
  }, 2000); // Dar tiempo a la interfaz para cargarse completamente
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

// Manejador para cambiar el tema
ipcMain.on('set-theme', (event, isDarkMode) => {
  if (mainWindow) {
    mainWindow.webContents.send('theme-changed', { isDarkMode });
  }
});

// Configuración para inicio automático en Windows
function setupAutoLaunch() {
  // Solo configurar en Windows y cuando no es entorno de desarrollo
  if (process.platform === 'win32' && !process.argv.includes('--dev')) {
    const appFolder = path.dirname(process.execPath);
    const updateExe = path.resolve(appFolder, '..', 'Update.exe');
    const exeName = path.basename(process.execPath);
    
    const { spawn } = require('child_process');
    
    // Configura para ejecutar al inicio
    app.setLoginItemSettings({
      openAtLogin: true,
      path: updateExe,
      args: [
        '--processStart', `"${exeName}"`,
        '--process-start-args', `"--hidden"`
      ]
    });
    
    console.log('Configuración de inicio automático aplicada');
  }
}

// Ejecutar la configuración de inicio automático
setupAutoLaunch();
