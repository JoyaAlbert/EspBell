#include <WiFi.h>
#include "PicoMQTT.h"

// WiFi credentials

// MQTT Broker configuration
const char* mqtt_server = "192.168.1.210";  // Dirección IP del broker MQTT
const int mqtt_port = 1883;                 // Puerto por defecto de MQTT
const char* mqtt_topic = "casa/timbre";     // Topic para publicar
const char* mqtt_client_id = "ESPBell";     // ID del cliente MQTT


// Pin configuration
const int sensorPin = 13;  // Pin donde conectar el sensor del timbre (cambiar según sea necesario)
const int ledPin = 2;     // LED integrado en muchas placas ESP32

// Variables para interrupciones y bajo consumo
volatile bool bellPressed = false;
volatile unsigned long lastInterruptTime = 0;
const unsigned long debounceDelay = 50;

// Variables de reconexión optimizadas
unsigned long lastConnectionCheck = 0;
const unsigned long connectionCheckInterval = 120000; // Cada 2 minutos para ahorrar energía

// Cliente MQTT usando PicoMQTT - Crear con los parámetros de conexión
// Simplificado para mejor compatibilidad
PicoMQTT::Client mqttClient;

// Función de interrupción para detección inmediata del timbre
void IRAM_ATTR handleBellPress() {
  unsigned long currentTime = millis();
  // Debounce simple en la interrupción
  if (currentTime - lastInterruptTime > debounceDelay) {
    bellPressed = true;
    lastInterruptTime = currentTime;
  }
}

void setup_wifi() {
  delay(10);
  // Iniciar conexión WiFi
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.println("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  // Intentar conectar al broker MQTT
  PicoMQTT::ConnectReturnCode returnCode;
  
  Serial.println("Intentando conectar al broker MQTT...");
  
  // Intentar la conexión hasta que se conecte (sin límite de intentos)
  int attempts = 0;
  bool connected = false;
  
  while (!connected) {
    attempts++;
    
    // Conectar al servidor MQTT usando parámetros directamente
    if (mqttClient.connect(mqtt_server, mqtt_port, mqtt_client_id, NULL, NULL, NULL, NULL, 0, 0, false, true, &returnCode)) {
      connected = true;
      Serial.println("¡Conectado al broker MQTT!");
      
      // Suscribirse al topic para escuchar mensajes (opcional)
      // mqttClient.subscribe(mqtt_topic);
      
      // Encender el LED para indicar que se ha conectado correctamente
      digitalWrite(ledPin, LOW); // LED encendido
      
      // Enviar mensaje de prueba
      if (mqttClient.publish(mqtt_topic, "ESP32 Timbre conectado", false)) {
        Serial.println("Mensaje de conexión enviado al broker MQTT");
        // Parpadear LED para confirmar envío del mensaje de prueba
        for (int i = 0; i < 3; i++) {
          digitalWrite(ledPin, HIGH);  // LED apagado
          delay(100);
          digitalWrite(ledPin, LOW); // LED encendido
          delay(100);
        }
      } else {
        Serial.println("Error al enviar mensaje de prueba");
      }
    } else {
      Serial.print("Error al conectar con el broker MQTT, código: ");
      Serial.print((int)returnCode);
      Serial.print(" - Intento ");
      Serial.println(attempts);
      
      // Apagar el LED para indicar que hay un problema
      digitalWrite(ledPin, HIGH); // LED apagado
      
      // Esperar más tiempo entre reintentos (backoff progresivo)
      int delayTime = min(attempts * 2000, 10000); // Máximo 10 segundos
      Serial.print("Esperando ");
      Serial.print(delayTime / 1000);
      Serial.println(" segundos antes del próximo intento...");
      delay(delayTime);
    }
  }
}

void setup() {
  pinMode(sensorPin, INPUT);
  pinMode(ledPin, OUTPUT);
  
  // Iniciar con el LED apagado para indicar que se está configurando
  digitalWrite(ledPin, HIGH);  // LED apagado
  
  Serial.begin(115200);
  delay(1000); // Esperar a que se inicialice la comunicación serial
  
  Serial.println("\n\n=== ESP32 Bell System ===");
  Serial.println("Iniciando...");
  
  setup_wifi();
  
  // Esperar 2 segundos para que la red se estabilice antes de intentar conectar al MQTT
  delay(2000);
  
  connectMQTT();
  
  // Configurar interrupción para el pin del sensor
  attachInterrupt(digitalPinToInterrupt(sensorPin), handleBellPress, RISING);
  
  Serial.println("Sistema listo - WiFi siempre conectado");
}

void loop() {
  // Verificar si se detectó el timbre
  if (bellPressed) {
    bellPressed = false; // Resetear la bandera
    
    Serial.println("¡Timbre detectado!");
    
    // Enviar mensaje inmediatamente
    if (mqttClient.publish(mqtt_topic, "RING", false)) {
      Serial.println("Mensaje enviado al broker MQTT");
      // Parpadear LED brevemente para confirmar envío
      digitalWrite(ledPin, HIGH);
      delay(100);
      digitalWrite(ledPin, LOW);
    } else {
      Serial.println("Error al enviar mensaje MQTT - reconectando...");
      digitalWrite(ledPin, HIGH); // LED apagado
      connectMQTT(); // Reconectar hasta que funcione
      // Intentar enviar nuevamente después de reconectar
      if (mqttClient.publish(mqtt_topic, "RING", false)) {
        Serial.println("Mensaje reenviado exitosamente");
        digitalWrite(ledPin, LOW); // LED encendido
      } else {
        Serial.println("Error: No se pudo reenviar el mensaje");
      }
    }
  }
  
  // Verificar conexiones cada 2 minutos
  if (millis() - lastConnectionCheck > connectionCheckInterval) {
    lastConnectionCheck = millis();
    
    // Verificar la conexión WiFi
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("Conexión WiFi perdida. Reconectando...");
      digitalWrite(ledPin, HIGH); // LED apagado
      setup_wifi();
      delay(2000);
      connectMQTT(); // Reconectar MQTT después de WiFi
    } else {
      // Solo verificar si podemos publicar al topic (sin heartbeat)
      Serial.println("WiFi conectado - Verificando conexión MQTT...");
      
      // Intentar publicar un mensaje silencioso para verificar la conexión
      if (!mqttClient.publish(mqtt_topic, "", false)) {
        Serial.println("Conexión MQTT perdida. Reconectando...");
        digitalWrite(ledPin, HIGH); // LED apagado
        connectMQTT(); // Reconectar hasta que funcione
      } else {
        Serial.println("Conexiones WiFi y MQTT activas");
      }
    }
  }
  
  // Procesar mensajes MQTT
  mqttClient.loop();
  
  // Pausa corta
  delay(100);
}