// Archivo principal del proceso de Electron
const { app, BrowserWindow, ipcMain, Menu, nativeTheme, shell } = require('electron');
const path = require('path');
const axios = require('axios');
const { MAIN_WINDOW_CONFIG, RENDERER_PATH } = require('./config');
const mqttManager = require('./mqtt-manager');

// Manejo del inicio automático en Windows
if (require('electron-squirrel-startup')) app.quit();

// Mantener una referencia global del objeto window
// para evitar que la ventana se cierre automáticamente 
// cuando el objeto JavaScript es basura recolectada.
let mainWindow;

// Información de la versión actual y GitHub
const GITHUB_REPO = 'JoyaAlbert/EspBell';
const CURRENT_VERSION = app.getVersion(); // Obtiene la versión del package.json

// Función para verificar si hay una nueva versión disponible
async function checkForUpdates() {
  try {
    const response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    const latestRelease = response.data;
    
    // El tag_name debe tener el formato vx.y.z (según los commits)
    const tagVersion = latestRelease.tag_name;
    // Conservamos el formato completo del tag (con la 'v')
    const latestVersion = tagVersion;
    
    console.log(`Versión actual: v${CURRENT_VERSION}, Última versión disponible: ${latestVersion}`);
    
    // Comparamos solo los números sin la 'v'
    const currentVersionNum = CURRENT_VERSION;
    const latestVersionNum = latestVersion.replace(/^v/, '');
    
    // Comparación de versiones utilizando semver
    const isNewer = compareVersions(latestVersionNum, currentVersionNum);
    
    if (isNewer > 0) {
      console.log('Hay una nueva versión disponible');
      return {
        hasUpdate: true,
        version: latestVersion,
        releaseUrl: latestRelease.html_url,
        releaseNotes: latestRelease.body
      };
    }
    
    return { hasUpdate: false };
  } catch (error) {
    console.error('Error al verificar actualizaciones:', error.message);
    return { hasUpdate: false, error: error.message };
  }
}

// Función para comparar versiones (simplificada)
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  // Comparar las partes de la versión
  for(let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if(part1 > part2) return 1;  // v1 es mayor
    if(part1 < part2) return -1; // v2 es mayor
  }
  
  return 0; // Versiones iguales
}

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
app.whenReady().then(async () => {
  createWindow();
  
  // Configurar detector de cambio de tema (claro/oscuro)
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      const isDarkMode = nativeTheme.shouldUseDarkColors;
      mainWindow.webContents.send('theme-changed', { isDarkMode });
    }
  });
  
  // Verificar actualizaciones
  const updateInfo = await checkForUpdates();
  if (updateInfo.hasUpdate && mainWindow) {
    mainWindow.webContents.send('update-available', updateInfo);
  }
  
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
          
          // Suscribirse a los topics de chat
          const chatTopics = ['casa/chat/Albert', 'casa/chat/Ale', 'casa/chat/Mama'];
          chatTopics.forEach(topic => {
            mqttManager.subscribe(topic)
              .then(subscribedTopic => {
                console.log(`Suscrito a ${subscribedTopic}`);
              })
              .catch(err => {
                console.error(`Error al suscribirse a ${topic}:`, err);
              });
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
          
          // Si es un mensaje de chat, solo enviarlo como mensaje regular
          // El renderizador se encargará de manejarlo apropiadamente
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

// Manejador para abrir el enlace de descarga de la actualización
ipcMain.on('open-update-link', (event, url) => {
  shell.openExternal(url);
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
// Test change
// Test change 2
