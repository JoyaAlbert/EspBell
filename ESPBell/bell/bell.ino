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

// Variables
int lastButtonState = LOW;  // Estado anterior del sensor
int buttonState;            // Estado actual del sensor
unsigned long lastDebounceTime = 0;  // Último tiempo que el pin cambió
unsigned long debounceDelay = 50;    // Tiempo de debounce en ms

// Cliente MQTT usando PicoMQTT - Crear con los parámetros de conexión
// Simplificado para mejor compatibilidad
PicoMQTT::Client mqttClient;

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
  
  // Intentar la conexión varias veces
  int attempts = 0;
  bool connected = false;
  
  while (!connected && attempts < 5) {
    // Conectar al servidor MQTT usando parámetros directamente
    if (mqttClient.connect(mqtt_server, mqtt_port, mqtt_client_id, NULL, NULL, NULL, NULL, 0, 0, false, true, &returnCode)) {
      connected = true;
      Serial.println("¡Conectado al broker MQTT!");
      
      // Encender el LED para indicar que se ha conectado correctamente (invertimos la lógica)
      digitalWrite(ledPin, LOW); // LED encendido
      
      // Enviar mensaje de prueba
      if (mqttClient.publish(mqtt_topic, "ESP32 Timbre conectado", false)) {
        Serial.println("Mensaje de prueba enviado al broker MQTT");
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
      attempts++;
      Serial.print("Error al conectar con el broker MQTT, código: ");
      Serial.print((int)returnCode);
      Serial.print(" - Intento ");
      Serial.print(attempts);
      Serial.println(" de 5");
      
      // Apagar el LED para indicar que hay un problema (invertimos la lógica)
      digitalWrite(ledPin, HIGH); // LED apagado
      
      delay(1000); // Esperar antes de reintentar
    }
  }
  
  if (!connected) {
    Serial.println("No se pudo conectar al broker después de 5 intentos");
  }
}

void setup() {
  pinMode(sensorPin, INPUT);
  pinMode(ledPin, OUTPUT);
  
  // Iniciar con el LED apagado para indicar que se está configurando (invertimos lógica)
  digitalWrite(ledPin, HIGH);  // LED apagado
  
  Serial.begin(115200);
  delay(1000); // Esperar a que se inicialice la comunicación serial
  
  Serial.println("\n\n=== ESP32 Bell System ===");
  Serial.println("Iniciando...");
  
  setup_wifi();
  
  // Esperar 2 segundos para que la red se estabilice antes de intentar conectar al MQTT
  delay(2000);
  
  connectMQTT();
}

void loop() {
  // Verificar la conexión WiFi y reconectar si es necesario
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Conexión WiFi perdida. Reconectando...");
    // Apagar el LED para indicar que se está intentando reconectar (invertimos lógica)
    digitalWrite(ledPin, HIGH); // LED apagado
    setup_wifi();
    
    // Esperar a que la red se estabilice antes de intentar reconectar MQTT
    delay(2000);
    
    connectMQTT();
  }
  
  // Verificar la conexión MQTT con menos frecuencia (cada 30 segundos)
  static unsigned long lastConnectionCheck = 0;
  
  if (millis() - lastConnectionCheck > 30000) {  // 30 segundos
    lastConnectionCheck = millis();
    
    // Intentar publicar un mensaje pequeño para ver si la conexión sigue activa
    if (!mqttClient.publish("casa/heartbeat", "ok", false)) {
      Serial.println("Conexión MQTT perdida. Reconectando...");
      // Apagar el LED para indicar que se está intentando reconectar (invertimos lógica)
      digitalWrite(ledPin, HIGH); // LED apagado
      connectMQTT();
    } else {
      Serial.println("Conexión MQTT activa");
    }
  }
  
  // Procesar mensajes MQTT
  mqttClient.loop();

  // Leer el estado del sensor del timbre
  int reading = digitalRead(sensorPin);

  // Si el estado ha cambiado, debido a ruido o presión real
  if (reading != lastButtonState) {
    // Resetear el temporizador de debounce
    lastDebounceTime = millis();
  }

  // Si ha pasado suficiente tiempo desde el último cambio
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // Si el estado ha cambiado realmente
    if (reading != buttonState) {
      buttonState = reading;

      // Solo enviar mensaje MQTT cuando el sensor detecta voltaje alto (HIGH)
      if (buttonState == HIGH) {
        Serial.println("¡Timbre detectado!");
        
        // Publicar mensaje en el topic MQTT
        if (mqttClient.publish(mqtt_topic, "RING", false)) {
          Serial.println("Mensaje enviado al broker MQTT");
          // Parpadear LED brevemente para indicar envío (invertimos lógica)
          digitalWrite(ledPin, HIGH);  // LED apagado
          delay(100);
          digitalWrite(ledPin, LOW); // LED encendido
        } else {
          Serial.println("Error al enviar mensaje MQTT");
        }
      }
    }
  }

  // Guardar la lectura para la próxima iteración
  lastButtonState = reading;
  
  // Pequeña pausa para estabilidad
  delay(10);
}