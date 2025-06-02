# MQTT WebSocket Tester

This is a testing interface for connecting to an MQTT broker through a WebSocket proxy. It's designed to work around browser limitations with direct MQTT TCP connections.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the WebSocket proxy:
   ```bash
   node proxy.js
   ```

3. Open `brokerTest.html` in your web browser to access the testing interface.

## Components

- `brokerTest.html`: Web interface for MQTT testing
- `proxy.js`: WebSocket to MQTT proxy server
- `package.json`: Project dependencies and scripts

## Configuration

The proxy connects to an MQTT broker at `192.168.1.210:1883` and creates a WebSocket server on port 8080.

## Usage

1. Start the proxy server
2. Open the web interface
3. Use the interface to:
   - Connect/disconnect from the MQTT broker
   - Subscribe to topics
   - Publish messages
   - View incoming messages
