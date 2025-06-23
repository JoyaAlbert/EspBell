# ESP32 MQTT Broker con Pantalla OLED

Este proyecto implementa un broker MQTT en ESP32 con una pantalla OLED de 0.96 pulgadas que muestra el estado del sistema y notificaciones del timbre.

## Características

- ✅ Broker MQTT completo
- 🖥️ Pantalla OLED de estado en tiempo real
- 🌐 Verificación de conexión a internet
- 🔔 Alerta visual cuando suena el timbre
- 📊 Estadísticas de funcionamiento

## Componentes Necesarios

1. **ESP32** (cualquier modelo con WiFi)
2. **Pantalla OLED 0.96"** (SSD1306, 128x64 píxeles)
3. **Cables de conexión**

## Conexiones de Hardware

### Pantalla OLED (SSD1306)
```
Pantalla OLED    →    ESP32
VCC              →    3.3V
GND              →    GND
SCL              →    GPIO 22
SDA              →    GPIO 21
```

### LED Indicador
```
LED Integrado    →    GPIO 2 (ya incluido en la placa)
```

## Librerías Requeridas

Para compilar este código, necesitas instalar las siguientes librerías en el Arduino IDE:

1. **PicoMQTT** - Para el broker MQTT
   ```
   Herramientas → Administrar Librerías → Buscar "PicoMQTT"
   ```

2. **Adafruit SSD1306** - Para la pantalla OLED
   ```
   Herramientas → Administrar Librerías → Buscar "Adafruit SSD1306"
   ```

3. **Adafruit GFX Library** - Para gráficos
   ```
   Herramientas → Administrar Librerías → Buscar "Adafruit GFX"
   ```

## Configuración

1. **Configurar WiFi**: Edita las variables `ssid` y `password` en el código:
   ```cpp
   const char* ssid = "TU_RED_WIFI";
   const char* password = "TU_CONTRASEÑA";
   ```

2. **Configurar IP estática** (opcional): Modifica la IP según tu red:
   ```cpp
   IPAddress local_IP(192, 168, 1, 210);   // Cambia por la IP deseada
   IPAddress gateway(192, 168, 1, 1);      // IP de tu router
   ```

## Funcionalidades de la Pantalla

### Información Mostrada
- **Estado de WiFi**: Conectado/Desconectado + IP asignada
- **Estado de Internet**: Verificación de conectividad real
- **Contador de mensajes**: Número total de mensajes MQTT procesados
- **Tiempo de funcionamiento**: Uptime del sistema

### Alertas del Timbre
Cuando se recibe un mensaje en el topic `casa/timbre`:
- La pantalla muestra "¡TIMBRE!" de forma prominente
- La alerta se mantiene visible durante 5 segundos
- Se registra el evento en el monitor serie

## Uso

1. Conecta todos los componentes según el diagrama
2. Sube el código al ESP32
3. Abre el Monitor Serie (115200 baudios) para ver los logs
4. La pantalla mostrará el estado del sistema en tiempo real

## Protocolo MQTT

- **Puerto**: 1883 (estándar MQTT)
- **Topic del timbre**: `casa/timbre`
- **Sin autenticación**: El broker acepta conexiones de cualquier cliente

## Solución de Problemas

### La pantalla no enciende
- Verifica las conexiones VCC y GND
- Asegúrate de usar 3.3V, no 5V
- Comprueba que la dirección I2C sea correcta (0x3C)

### No detecta la pantalla
- Usa un escáner I2C para verificar la dirección
- Algunas pantallas usan la dirección 0x3D en lugar de 0x3C

### Error de librerías
- Instala todas las librerías requeridas desde el Administrador de Librerías
- Reinicia el Arduino IDE después de instalar las librerías

### WiFi no conecta
- Verifica nombre de red y contraseña
- Asegúrate de que la red sea de 2.4GHz (no 5GHz)
- Comprueba que el ESP32 esté dentro del rango de la red

## Monitor Serie

El ESP32 enviará información detallada al monitor serie:
- Estado de conexión WiFi
- Información de red (IP, gateway)
- Mensajes MQTT recibidos
- Estadísticas del broker
- Alertas del timbre

Para ver esta información, abre el Monitor Serie en Arduino IDE con velocidad 115200 baudios.
