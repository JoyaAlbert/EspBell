/*
 * ESP32 MQTT Broker
 * 
 * Este sketch configura un ESP32 como un broker MQTT accesible desde
 * cualquier dispositivo conectado a la misma red local.
 * 
 * Utiliza la biblioteca PicoMQTT para implementar el broker.
 */

#include <WiFi.h>
#include "PicoMQTT.h"

// Configuración de la red WiFi
const char* ssid =     // Nombre de tu red WiFi
const char* password =       // Contraseña de tu red WiFi

// Configuración de la IP estática (opcional pero recomendado para un broker)
IPAddress local_IP(192, 168, 1, 210);   // IP deseada para el ESP32
IPAddress gateway(192, 168, 1, 1);      // Puerta de enlace (router)
IPAddress subnet(255, 255, 255, 0);     // Máscara de subred
IPAddress dns(8, 8, 8, 8);              // DNS (Google)

// Configuración de hardware
const int ledPin = 2;                   // LED integrado del ESP32 (puede variar según modelo)
const int mqttPort = 1883;              // Puerto estándar para MQTT

// Estadísticas del broker
unsigned long lastStatsTime = 0;
const unsigned long statsInterval = 60000; // Mostrar estadísticas cada minuto
unsigned int messageCount = 0;

// Clase personalizada para el servidor MQTT que extiende PicoMQTT::Server
class MyMQTTServer : public PicoMQTT::Server {
public:
  // Constructor con configuración más permisiva
  MyMQTTServer() : PicoMQTT::Server() {
    // La versión actual de PicoMQTT no expone keepalive_timeout como miembro público
  }
  
  // Método para manejar los mensajes entrantes
  void on_message(const char* topic, PicoMQTT::IncomingPacket& packet) override {
    // Parpadeo del LED para indicar mensaje recibido
    digitalWrite(ledPin, HIGH);
    
    // Incrementar contador de mensajes
    messageCount++;
    
    // Leer el contenido del mensaje
    uint8_t buffer[512];  // Buffer más grande para mensajes
    size_t idx = 0;
    
    while (packet.available() && idx < sizeof(buffer) - 1) {
      buffer[idx++] = packet.read();
    }
    buffer[idx] = '\0';  // Asegurar que termina con null para imprimir como string
    
    // Mostrar información del mensaje
    Serial.print("📬 Mensaje en topic '");
    Serial.print(topic);
    Serial.print("': ");
    Serial.println((char*)buffer);
    
    // Apagar el LED después de un breve periodo
    delay(100);
    digitalWrite(ledPin, LOW);
  }
};

// Crear instancia del servidor MQTT
MyMQTTServer mqttServer;

void setup() {
  // Inicializar comunicación serial
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n🚀 Iniciando broker MQTT en ESP32...");
  
  // Configurar el pin del LED
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Conectar a la red WiFi
  setupWiFi();
  
  // Configurar el nombre de host WiFi
  WiFi.setHostname("ESP32-MQTT-Broker");
  
  // Iniciar el broker MQTT en modo permisivo
  mqttServer.begin();
  
  // Información de red
  Serial.print("✅ Broker MQTT iniciado en la IP: ");
  Serial.print(WiFi.localIP());
  Serial.print(", puerto: ");
  Serial.println(mqttPort);
  Serial.println("✅ Listo para recibir conexiones de clientes MQTT");
  Serial.println("📢 Nombre de host: ESP32-MQTT-Broker");
  
  // Parpadear LED para indicar que está listo
  for (int i = 0; i < 5; i++) {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
}

void loop() {
  // Verificar la conexión WiFi y reconectar si es necesario
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ Conexión WiFi perdida. Reconectando...");
    setupWiFi();
  }
  
  // Llamar explícitamente a loop() para procesar clientes MQTT
  mqttServer.loop();
  
  // Mostrar estadísticas periódicamente
  if (millis() - lastStatsTime > statsInterval) {
    showStats();
    lastStatsTime = millis();
  }
}

// Función para configurar y conectar WiFi
void setupWiFi() {
  Serial.println("📶 Configurando conexión WiFi...");
  
  // Desconectar cualquier conexión WiFi previa
  WiFi.disconnect(true);
  delay(1000);
  
  // Establecer el modo WiFi a estación
  WiFi.mode(WIFI_STA);
  
  // Iniciar conexión WiFi
  WiFi.begin(ssid, password);
  Serial.print("🔄 Conectando a WiFi");
  
  // Esperar a que se conecte, con indicación visual
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledPin, !digitalRead(ledPin));  // Alternar LED
    Serial.print(".");
    delay(500);
    
    // Timeout después de 30 segundos
    if (millis() - startTime > 30000) {
      Serial.println("\n⚠️ Timeout al conectar a WiFi. Reiniciando...");
      ESP.restart();
    }
  }
  
  // Conexión exitosa
  digitalWrite(ledPin, LOW);
  Serial.println("\n✅ WiFi conectado");
  
  // Configurar IP estática después de conectar a WiFi
  if (WiFi.localIP() != local_IP) {
    Serial.println("🔄 Configurando IP estática...");
    if (WiFi.config(local_IP, gateway, subnet, dns)) {
      Serial.println("✅ IP estática configurada correctamente");
    } else {
      Serial.println("⚠️ Error al configurar IP estática, usando DHCP: " + WiFi.localIP().toString());
    }
  }
  
  Serial.print("📍 IP del ESP32: ");
  Serial.println(WiFi.localIP());
}

// Función para mostrar estadísticas del broker
void showStats() {
  Serial.println("\n📊 Estadísticas del broker MQTT:");
  Serial.print("  ⏱️ Tiempo activo: ");
  unsigned long uptime = millis() / 1000;
  if (uptime < 60) {
    Serial.print(uptime);
    Serial.println(" segundos");
  } else if (uptime < 3600) {
    Serial.print(uptime / 60);
    Serial.print(" minutos, ");
    Serial.print(uptime % 60);
    Serial.println(" segundos");
  } else {
    Serial.print(uptime / 3600);
    Serial.print(" horas, ");
    Serial.print((uptime % 3600) / 60);
    Serial.println(" minutos");
  }
  
  Serial.print("  📨 Mensajes procesados: ");
  Serial.println(messageCount);
  Serial.print("  🔌 Clientes conectados: ");
  Serial.println("N/A"); // PicoMQTT no proporciona esta información
  Serial.println();
}
