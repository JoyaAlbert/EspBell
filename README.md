# EspBell Project

A complete IoT communication system based on MQTT that includes a desktop application, an ESP32 broker, and testing tools. To control a house doorbell connected to an ESP32.

## Project Components

### 📱 APP
Electron desktop application for controlling and monitoring IoT devices. Features a modern interface with light/dark theme support and advanced MQTT connection management.

[View APP documentation](APP/README.md)

### 🔌 ESPbroker
MQTT broker implementation on ESP32, enabling efficient and secure IoT device communication.

Key features:
- Integrated MQTT broker on ESP32
- Customizable WiFi configuration
- Efficient connection management
- Low power consumption

[View ESPbroker documentation](ESPbroker/README.md)

### 🧪 Tester
Testing tools for the MQTT system, including a web interface for connection testing and a WebSocket proxy.

[View Tester documentation](tester/README.md)

## Project Structure

```
EspBell/
├── APP/                    # Electron desktop application
├── ESPbroker/             # ESP32-based MQTT broker
│   └── broker/            # Broker source code
└── tester/                # Testing tools
    ├── brokerTest.html    # Web testing interface
    └── proxy.js           # WebSocket-MQTT proxy
```

## Getting Started

1. **Configure ESP32 Broker**:
   - Flash the code to ESP32 from `ESPbroker` folder
   - Configure network parameters

2. **Run Desktop Application**:
   - Navigate to `APP` folder
   - Follow README instructions

3. **Test the System**:
   - Use tools in `tester` folder
   - Connect to broker via WebSocket proxy

## Deployment & Releases

This project uses a semantic versioning system for releases. The application name is always "ESPBell" (without version information in the filename).

### Creating a New Release

To create a new release:

1. Navigate to the APP directory:
   ```bash
   cd APP
   ```

2. Run the release script with the desired version number:
   ```bash
   npm run release 1.2.3 "Description of changes in this version"
   ```
   Where:
   - `1.2.3` is the version number in x.y.z format
   - The description is optional but recommended

3. The script will:
   - Create a Git tag with format `v1.2.3`
   - Push the tag to GitHub
   - Build the application for Windows and Linux
   - Provide instructions for uploading the files to GitHub

### Automatic Update Detection

The application automatically checks for new versions when it starts. If a newer version is available, it will display a notification with a download button that takes users to the GitHub release page.

For more detailed information about the versioning system, see [VERSIONES.md](APP/docs/VERSIONES.md).






