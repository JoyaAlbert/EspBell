const WebSocket = require('ws');
const mqtt = require('mqtt');
const http = require('http');

// Crear servidor HTTP
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Proxy MQTT-WebSocket funcionando');
});

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

// Configuración MQTT
const MQTT_BROKER = 'mqtt://192.168.1.210:1883';

wss.on('connection', function connection(ws) {
    console.log('Nueva conexión WebSocket');

    // Conectar al broker MQTT
    const mqttClient = mqtt.connect(MQTT_BROKER);

    mqttClient.on('connect', () => {
        console.log('Conectado al broker MQTT');
        ws.send(JSON.stringify({ type: 'connect' }));
    });

    mqttClient.on('error', (error) => {
        console.error('Error MQTT:', error);
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
    });

    mqttClient.on('message', (topic, message) => {
        console.log(`Mensaje recibido en ${topic}: ${message.toString()}`);
        ws.send(JSON.stringify({
            type: 'message',
            topic: topic,
            message: message.toString()
        }));
    });

    ws.on('message', function incoming(data) {
        try {
            const message = JSON.parse(data);
            switch (message.type) {
                case 'subscribe':
                    mqttClient.subscribe(message.topic);
                    break;
                case 'publish':
                    mqttClient.publish(message.topic, message.message);
                    break;
            }
        } catch (error) {
            console.error('Error al procesar mensaje:', error);
        }
    });

    ws.on('close', function close() {
        console.log('Cliente WebSocket desconectado');
        mqttClient.end();
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Proxy ejecutándose en puerto ${PORT}`);
});
