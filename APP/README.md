# EspBell Desktop Client

Desktop application for the EspBell system, designed to communicate with the smart doorbell via MQTT. Built with Electron to provide a native experience across multiple platforms.

## 🚀 Key Features

- 🔔 EspBell smart doorbell control
- 📡 MQTT connection management
- 🌙 Automatic light/dark themes
- 📱 Integrated system notifications
- 🖥️ Cross-platform support (Windows/Linux)

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Git (for cloning repository)

### From Source Code

```bash
# Clone repository
git clone https://github.com/user/espbell-desktop.git

# Install dependencies
npm install

# Start in development mode
npm start
```

## 📂 Project Structure

```
APP/
├── src/
│   ├── main/              # Main process
│   │   ├── main.js        # Main entry
│   │   ├── config.js      # Configuration
│   │   ├── mqtt-manager.js # MQTT handler
│   │   └── preload.js     # Preload script
│   └── renderer/          # UI
│       └── index.html     # Main interface
├── public/               # Static assets
├── docs/                # Documentation
└── scripts/             # Build scripts
```

## ⚙️ Configuration

### MQTT

MQTT broker configuration in `src/main/config.js`:

```javascript
{
  broker: {
    host: '192.168.1.210',
    port: 1883,
    protocol: 'mqtt',
    username: '', // optional
    password: ''  // optional
  }
}
```


### Initial Setup

1. Launch application
2. Configure MQTT in Settings
3. Connect to broker

## 🔧 Development

```bash
# Development
npm start         # Start dev mode
npm run dev       # Start with hot reload

# Building
npm run build     # Build for current platform
npm run build:win # Build for Windows
npm run build:linux # Build for Linux
```

## 📦 Distribution and Versioning

ESPBell usa un sistema de versionado semántico. El ejecutable siempre se llama "ESPBell" sin información de versión en el nombre del archivo.

### Crear un Release

Para crear un nuevo release, simplemente incluye la versión en el mensaje del commit:

```bash
git add .
git commit -m "Descripción de los cambios v1.2.3"
git push origin main
```

Esto activará GitHub Actions que:
1. Detectará la versión en el mensaje del commit
2. Actualizará la versión en package.json
3. Generará el ejecutable
4. Creará un release en GitHub con la etiqueta v1.2.3

### Actualizaciones Automáticas

La aplicación verifica automáticamente si hay nuevas versiones en GitHub al iniciarse. Si encuentra una versión más reciente, mostrará una notificación con un botón para descargar la actualización.

Para más detalles sobre el sistema de versiones, consulta [VERSIONES.md](./docs/VERSIONES.md).

### Archivos Generados

Los archivos generados se encuentran en la carpeta `dist/`:

```bash
dist/
├── win-unpacked/  # Windows portable
├── linux-unpacked/# Linux portable
└── ESPBell.exe, ESPBell.AppImage, etc.  # Instaladores
```


