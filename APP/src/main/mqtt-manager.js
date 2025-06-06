// Módulo para gestionar las conexiones MQTT
const mqtt = require('mqtt');
const { DEFAULT_MQTT_CONFIG } = require('./config');

class MqttManager {
  constructor() {
    this.client = null;
    this.subscribers = new Set();
    this.config = { ...DEFAULT_MQTT_CONFIG };
  }

  // Método para conectar al broker MQTT
  connect(options = {}) {
    // Cerrar la conexión existente si la hay
    if (this.client) {
      this.disconnect();
    }

    // Combinar opciones predeterminadas con las proporcionadas
    const mqttOptions = {
      clientId: options.clientId || this.config.clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      username: options.username,
      password: options.password
    };

    // Conectar al broker
    const brokerUrl = options.url || this.config.broker;
    this.client = mqtt.connect(brokerUrl, mqttOptions);

    // Configurar manejadores de eventos
    this._setupEventHandlers();

    return this.client;
  }

  // Método para desconectar del broker MQTT
  disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  // Método para suscribirse a un tema
  subscribe(topic) {
    if (!this.client || !this.client.connected) {
      throw new Error('No hay conexión MQTT activa');
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          this.subscribers.add(topic);
          resolve(topic);
        }
      });
    });
  }

  
  // Método para cancelar la suscripción a un tema
  unsubscribe(topic) {
    if (!this.client || !this.client.connected) {
      throw new Error('No hay conexión MQTT activa');
    }

    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          this.subscribers.delete(topic);
          resolve(topic);
        }
      });
    });
  }

  // Método para publicar un mensaje
  publish(topic, message, options = {}) {
    if (!this.client || !this.client.connected) {
      throw new Error('No hay conexión MQTT activa');
    }

    return new Promise((resolve, reject) => {
      this.client.publish(topic, message, options, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ topic, message });
        }
      });
    });
  }

  // Método para configurar los manejadores de eventos
  _setupEventHandlers() {
    // Estos manejadores solo registran eventos. Se espera que
    // el código que utilice esta clase establezca sus propios manejadores
    // con client.on() después de llamar a connect()
    this.client.on('connect', () => {
      console.log('Conectado al broker MQTT');
    });

    this.client.on('reconnect', () => {
      console.log('Intentando reconectar al broker MQTT...');
    });

    this.client.on('close', () => {
      console.log('Desconectado del broker MQTT');
    });

    this.client.on('error', (err) => {
      console.error('Error de MQTT:', err);
    });

    this.client.on('message', (topic, message) => {
      console.log(`Mensaje recibido en el tema ${topic}: ${message.toString()}`);
    });
  }

  // Método para verificar si hay una conexión activa
  isConnected() {
    return this.client && this.client.connected;
  }

  // Método para obtener el cliente MQTT subyacente
  getClient() {
    return this.client;
  }
}

module.exports = new MqttManager();
