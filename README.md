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

This project uses GitHub Actions for automated builds and releases. A new release will be automatically created every time you push changes to the `main` branch that affect the `APP` folder.

The process is completely automatic:

1. Make your changes in the code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

The GitHub Actions workflow will automatically:
- Build the Windows executable (.exe)
- Create a new GitHub release with format `YYYYMMDD_commit-hash`
- Upload the executable to the release

Each release will be tagged automatically with the date and commit hash, making it easy to track which version corresponds to which code changes.






