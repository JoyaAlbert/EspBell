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

## 📦 Distribution

Build artifacts are generated in `dist/` folder:

```bash
dist/
├── win-unpacked/  # Windows portable
├── linux-unpacked/# Linux portable
└── *.exe, *.deb   # Installers
```


