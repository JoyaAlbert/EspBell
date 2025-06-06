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

This project uses GitHub Actions for automated builds and releases. When you want to create a new release with the Windows executable:

1. Update the version in `APP/package.json`
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Release vX.Y.Z"
   ```

3. Create and push a new tag:
   ```bash
   git tag vX.Y.Z
   git push origin main --tags
   ```

For example, for version 1.0.0:
```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

The GitHub Actions workflow will automatically:
- Build the Windows executable (.exe)
- Create a new GitHub release
- Upload the executable to the release





