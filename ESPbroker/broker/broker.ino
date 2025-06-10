/*
 * ESP32 MQTT Broker con pantalla OLED
 * 
 * Este sketch configura un ESP32 como un broker MQTT accesible desde
 * cualquier dispositivo conectado a la misma red local.
 * 
 * Utiliza la biblioteca PicoMQTT para implementar el broker.
 * Incluye una pantalla OLED de 0.96" para mostrar estado y notificaciones.
 * 
 * CONEXIONES DE HARDWARE:
 * ======================
 * 
 * Pantalla OLED (SSD1306 128x64):
 * ┌─────────────┐     ┌─────────────┐
 * │   ESP32     │     │ Pantalla    │
 * │             │     │ OLED 0.96"  │
 * │     3.3V  ──┼─────┼── VCC       │
 * │      GND  ──┼─────┼── GND       │
 * │ GPIO 22   ──┼─────┼── SCL       │
 * │ GPIO 21   ──┼─────┼── SDA       │
 * └─────────────┘     └─────────────┘
 * 
 * LED Indicador:
 * - GPIO 2: LED integrado del ESP32 (indica actividad MQTT)
 * 
 * LIBRERÍAS REQUERIDAS:
 * ====================
 * - PicoMQTT (broker MQTT)
 * - Adafruit SSD1306 (pantalla OLED)
 * - Adafruit GFX Library (gráficos)
 * 
 * FUNCIONALIDADES DE LA PANTALLA:
 * ===============================
 * - Estado WiFi (conectado/desconectado + IP)
 * - Estado de internet (verificación real)
 * - Contador de mensajes MQTT
 * - Tiempo de funcionamiento
 * - ALERTA VISUAL cuando suena el timbre (topic: casa/timbre)
 */

#include <WiFi.h>
#include "PicoMQTT.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Configuración de la pantalla OLED
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C

// Configuración de la red WiFi

// Configuración de la IP estática (opcional pero recomendado para un broker)
IPAddress local_IP(192, 168, 1, 210);   // IP deseada para el ESP32
IPAddress gateway(192, 168, 1, 1);      // Puerta de enlace (router)
IPAddress subnet(255, 255, 255, 0);     // Máscara de subred
IPAddress dns(8, 8, 8, 8);              // DNS (Google)

// Configuración de hardware
const int ledPin = 2;                   // LED integrado del ESP32 (puede variar según modelo)
const int mqttPort = 1883;              // Puerto estándar para MQTT

// Variables para el manejo de la pantalla y estado
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Variables de estado
bool internetConnected = false;
bool doorbellPressed = false;
unsigned long lastDoorbellTime = 0;
const unsigned long doorbellDisplayTime = 5000; // Mostrar alerta del timbre por 5 segundos

// Estadísticas del broker
unsigned long lastStatsTime = 0;
const unsigned long statsInterval = 60000; // Mostrar estadísticas cada minuto
unsigned int messageCount = 0;

// Variables para actualización de pantalla
unsigned long lastDisplayUpdate = 0;
const unsigned long displayUpdateInterval = 1000; // Actualizar pantalla cada segundo

// Declaraciones de funciones (forward declarations)
void updateDisplay();
void initDisplay();
bool checkInternetConnection();
void setupWiFi();
void showStats();

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
    
    // Verificar si es el topic del timbre
    if (strcmp(topic, "casa/timbre") == 0) {
      doorbellPressed = true;
      lastDoorbellTime = millis();
      Serial.println("🔔 ¡TIMBRE ACTIVADO!");
      updateDisplay(); // Actualizar pantalla inmediatamente
    }
    
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

// Función para inicializar la pantalla OLED
void initDisplay() {
  Serial.println("🖥️ Inicializando pantalla OLED...");
  
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("❌ Error: No se pudo inicializar la pantalla OLED");
    return;
  }
  
  // Limpiar el buffer de la pantalla
  display.clearDisplay();
  
  // Configurar texto inicial
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("ESPBell Broker");
  display.println("Iniciando...");
  display.display();
  
  Serial.println("✅ Pantalla OLED inicializada");
}

// Función para verificar conexión a internet
bool checkInternetConnection() {
  WiFiClient client;
  const char* host = "8.8.8.8"; // Google DNS
  const int port = 53;
  
  if (client.connect(host, port)) {
    client.stop();
    return true;
  }
  return false;
}

// Función para actualizar la pantalla
void updateDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  // Título
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.println("ESPBell Broker");
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);
  
  // Estado de WiFi
  display.setCursor(0, 15);
  display.print("WiFi: ");
  if (WiFi.status() == WL_CONNECTED) {
    display.println("Conectado");
    display.setCursor(0, 25);
    display.print("IP: ");
    display.println(WiFi.localIP().toString());
  } else {
    display.println("Desconectado");
  }
  
  // Estado de Internet
  display.setCursor(0, 35);
  display.print("Internet: ");
  if (internetConnected) {
    display.println("Si");
  } else {
    display.println("No");
  }
  
  // Verificar si hay que mostrar alerta del timbre
  if (doorbellPressed && (millis() - lastDoorbellTime < doorbellDisplayTime)) {
    // Mostrar alerta del timbre de forma prominente
    display.fillRect(0, 45, SCREEN_WIDTH, 19, SSD1306_WHITE);
    display.setTextColor(SSD1306_BLACK);
    display.setCursor(35, 50);
    display.setTextSize(2);
    display.println("TIMBRE!");
    display.setTextColor(SSD1306_WHITE);
  } else {
    // Resetear estado del timbre después del tiempo de visualización
    if (doorbellPressed && (millis() - lastDoorbellTime >= doorbellDisplayTime)) {
      doorbellPressed = false;
    }
    
    // Mostrar información normal
    display.setCursor(0, 45);
    display.setTextSize(1);
    display.print("Mensajes: ");
    display.println(messageCount);
    
    display.setCursor(0, 55);
    unsigned long uptime = millis() / 1000;
    display.print("Uptime: ");
    if (uptime < 60) {
      display.print(uptime);
      display.println("s");
    } else if (uptime < 3600) {
      display.print(uptime / 60);
      display.println("m");
    } else {
      display.print(uptime / 3600);
      display.println("h");
    }
  }
  
  display.display();
}

void setup() {
  // Inicializar comunicación serial
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n\n🚀 Iniciando broker MQTT en ESP32...");
  
  // Configurar el pin del LED
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  
  // Inicializar I2C para la pantalla OLED
  Wire.begin();
  
  // Inicializar pantalla OLED
  initDisplay();
  
  // Conectar a la red WiFi
  setupWiFi();
  
  // Configurar el nombre de host WiFi
  WiFi.setHostname("ESP32-MQTT-Broker");
  
  // Verificar conexión a internet
  internetConnected = checkInternetConnection();
  
  // Iniciar el broker MQTT en modo permisivo
  mqttServer.begin();
  
  // Información de red
  Serial.print("✅ Broker MQTT iniciado en la IP: ");
  Serial.print(WiFi.localIP());
  Serial.print(", puerto: ");
  Serial.println(mqttPort);
  Serial.println("✅ Listo para recibir conexiones de clientes MQTT");
  Serial.println("📢 Nombre de host: ESP32-MQTT-Broker");
  
  // Actualizar pantalla con información inicial
  updateDisplay();
  
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
    internetConnected = false;
    setupWiFi();
  }
  
  // Llamar explícitamente a loop() para procesar clientes MQTT
  mqttServer.loop();
  
  // Actualizar pantalla periódicamente
  if (millis() - lastDisplayUpdate > displayUpdateInterval) {
    // Verificar estado de internet cada vez que actualizamos la pantalla
    internetConnected = checkInternetConnection();
    updateDisplay();
    lastDisplayUpdate = millis();
  }
  
  // Mostrar estadísticas periódicamente
  if (millis() - lastStatsTime > statsInterval) {
    showStats();
    lastStatsTime = millis();
  }
}

// Función para configurar y conectar WiFi
void setupWiFi() {
  Serial.println("📶 Configurando conexión WiFi...");
  
  // Actualizar pantalla mostrando que está conectando
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("ESPBell Broker");
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println("Conectando WiFi...");
  display.display();
  
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
  int dots = 0;
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(ledPin, !digitalRead(ledPin));  // Alternar LED
    Serial.print(".");
    
    // Actualizar pantalla con puntos animados
    display.setCursor(0, 35);
    display.setTextColor(SSD1306_WHITE);
    display.fillRect(0, 35, SCREEN_WIDTH, 10, SSD1306_BLACK);
    for (int i = 0; i < dots; i++) {
      display.print(".");
    }
    display.display();
    dots = (dots + 1) % 4;
    
    delay(500);
    
    // Timeout después de 30 segundos
    if (millis() - startTime > 30000) {
      Serial.println("\n⚠️ Timeout al conectar a WiFi. Reiniciando...");
      display.clearDisplay();
      display.setCursor(0, 20);
      display.println("Error WiFi");
      display.println("Reiniciando...");
      display.display();
      delay(2000);
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
  
  // Mostrar mensaje de conexión exitosa en pantalla
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("ESPBell Broker");
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println("WiFi Conectado!");
  display.setCursor(0, 35);
  display.print("IP: ");
  display.println(WiFi.localIP().toString());
  display.display();
  delay(2000);
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
