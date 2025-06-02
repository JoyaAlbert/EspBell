# EspBell MQTT Client

Una aplicación de escritorio basada en Electron para recibir y enviar instrucciones MQTT a dispositivos IoT, con un diseño elegante y moderno.

## Características

- Conexión a cualquier broker MQTT
- Suscripción a múltiples temas
- Publicación de mensajes
- Interfaz de usuario elegante y moderna
- Soporte para tema claro y oscuro (automático según sistema)
- Animaciones y efectos visuales suaves
- Notificaciones integradas
- Soporte para conexiones seguras con autenticación
- Experiencia nativa en Windows y Linux

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
espbell/
├── docs/                   # Documentación del proyecto
├── public/                 # Archivos estáticos (iconos, imágenes)
├── src/                    # Código fuente
│   ├── main/               # Proceso principal de Electron
│   │   ├── main.js         # Punto de entrada de la aplicación
│   │   ├── config.js       # Configuración global
│   │   ├── mqtt-manager.js # Gestor de conexiones MQTT
│   │   └── preload.js      # Script de precarga para seguridad
│   └── renderer/           # Proceso de renderizado
│       └── index.html      # Interfaz de usuario
├── electron-builder.json   # Configuración para empaquetar la app
├── package.json            # Dependencias y scripts
└── README.md               # Este archivo
```

## Temas Claro y Oscuro

La aplicación soporta automáticamente temas claro y oscuro siguiendo la configuración del sistema operativo:

- **Tema Claro**: Diseño limpio y luminoso para uso diurno
- **Tema Oscuro**: Interfaz de bajo contraste para uso nocturno o en ambientes con poca luz

## Diseño Moderno y Elegante

El diseño de la aplicación presenta:

- Interfaz limpia y minimalista
- Esquinas redondeadas y controles modernos
- Paleta de colores profesional
- Animaciones suaves y transiciones fluidas
- Notificaciones integradas no intrusivas
- Iconografía minimalista

## Construcción de la Aplicación

Para construir la aplicación para diferentes plataformas:

```bash
# Iniciar en modo desarrollo
npm start

# Construir para Windows
npm run build:win

# Construir para Linux
npm run build:linux

# Construir versión portable para Windows
npm run build:portable

# Construir para todas las plataformas soportadas
npm run build:all
```

## Requisitos

- Node.js 16 o superior
- npm o yarn
- Electron 24 o superior

## Instalación

### Desde código fuente

1. Clona este repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Ejecuta la aplicación:
   ```
   npm start
   ```

### Descargar instaladores

Puedes encontrar los instaladores precompilados para Windows, macOS y Linux en la sección de releases.

## Uso

### Conectar a un broker MQTT

1. En la pestaña "Conexión", introduce la URL del broker MQTT.
   - Formato: `mqtt://servidor:puerto` o `mqtts://servidor:puerto` para conexiones seguras
2. Si es necesario, introduce las credenciales de usuario y contraseña
3. Haz clic en "Conectar"

### Suscribirse a temas

1. Ve a la pestaña "Mensajes"
2. Introduce el tema al que quieres suscribirte (por ejemplo, `espbell/commands`)
3. Haz clic en "Suscribir"

### Publicar mensajes

1. Ve a la pestaña "Publicar"
2. Introduce el tema en el que quieres publicar
3. Escribe el mensaje a enviar
4. Haz clic en "Publicar"

## Ejemplos de uso

### Comunicación con dispositivos ESP8266/ESP32

Esta aplicación es ideal para comunicarse con dispositivos basados en ESP8266 o ESP32 que utilizan el protocolo MQTT.

Ejemplo de estructura de temas:
- `espbell/device1/commands` - Para enviar comandos al dispositivo
- `espbell/device1/status` - Para recibir información de estado del dispositivo

## Desarrollo

### Estructura del proyecto

- `index.js` - Punto de entrada de la aplicación Electron
- `index.html` - Interfaz de usuario
- `package.json` - Configuración de la aplicación y dependencias

### Compilar para distribución

```
npm run build       # Construir para la plataforma actual
npm run build:win   # Construir para Windows
```

## Licencia

ISC

