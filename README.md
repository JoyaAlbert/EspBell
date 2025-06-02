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



