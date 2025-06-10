# ESP32 MQTT Broker con Pantalla OLED

Un broker MQTT eficiente implementado en ESP32, diseñado para comunicación IoT en el sistema EspBell. Incluye una pantalla OLED para monitoreo visual en tiempo real.

## 🚀 Características

- 🔌 Broker MQTT integrado en ESP32
- 📡 Configuración WiFi personalizable
- ⚡ Bajo consumo de energía
- 🔄 Gestión eficiente de conexiones
- 📊 Monitoreo básico con estadísticas
- 🖥️ **Pantalla OLED de 0.96" para estado visual**
- 🌐 **Verificación de conexión a internet**
- 🔔 **Alertas visuales del timbre**

## 🖥️ Pantalla OLED

La pantalla OLED muestra en tiempo real:
- Estado de conexión WiFi (Conectado/Desconectado)
- Dirección IP asignada
- Estado de conexión a internet
- Número de mensajes MQTT procesados
- Tiempo de funcionamiento (uptime)
- **Alerta prominente cuando suena el timbre**

### Conexiones de Hardware

```
Pantalla OLED (SSD1306)    →    ESP32
VCC                        →    3.3V
GND                        →    GND
SCL                        →    GPIO 22
SDA                        →    GPIO 21
```

### LED Indicadores

- LED de actividad: Parpadea con tráfico MQTT
- LED WiFi: Sólido cuando está conectado

## 📊 Monitoreo

Monitorea el estado del broker vía puerto Serie (115200 baudios) y en la pantalla OLED:
```
[INFO] Broker iniciado
[INFO] WiFi conectado
[INFO] Broker MQTT ejecutándose en 192.168.1.210:1883
[INFO] Pantalla OLED inicializada
```

## 📖 Documentación Detallada

Para instrucciones completas de instalación, configuración y uso de la pantalla OLED, consulta:
- [README_OLED.md](README_OLED.md) - Guía completa con diagramas de conexión y configuración

