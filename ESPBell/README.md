# 🔔 ESP32 Bell System

## Descripción

Sistema de timbre inteligente basado en ESP32 que envía notificaciones MQTT cuando se detecta que alguien llama a la puerta. Permite recibir alertas en dispositivos conectados a la red local cuando suena el timbre de casa.

## Componentes del Sistema

El sistema completo consta de tres partes principales:

1. **ESPBell**: ESP32 conectado al timbre que detecta cuando se activa y envía mensajes MQTT.
2. **ESPbroker**: ESP32 configurado como broker MQTT que gestiona los mensajes.
3. **APP**: Aplicación para recibir notificaciones en ordenadores y dispositivos móviles.

## Funcionamiento

1. El ESP32 conectado al timbre (ESPBell) monitoriza el pin GPIO 13.
2. Cuando detecta un voltaje alto en el pin (timbre activado), envía un mensaje "RING" al topic MQTT `casa/timbre`.
3. El broker MQTT (ESPbroker) recibe y distribuye este mensaje.
4. La aplicación cliente (APP) recibe la notificación y alerta al usuario.

## Configuración del Hardware

### ESPBell (Detector de Timbre)

- **Microcontrolador**: ESP32
- **Conexiones**:
  - GPIO 13: Conectado a la señal del timbre
  - GPIO 2: LED indicador
- **Alimentación**: 5V (USB o fuente de alimentación)

## Instalación

### Requisitos Previos

- Arduino IDE con soporte para ESP32
- Bibliotecas:
  - WiFi.h (incluida en el core ESP32)
  - PicoMQTT

### Pasos de Instalación

1. Instala la biblioteca PicoMQTT desde el Gestor de Bibliotecas del Arduino IDE
2. Abre el archivo `bell.ino` en la carpeta `ESPBell/bell/`
3. Configura las credenciales WiFi y la dirección IP del broker si es necesario
4. Compila y carga el código en el ESP32

## Indicadores LED

- **LED encendido (LOW)**: ESP32 conectado correctamente al broker MQTT
- **LED apagado (HIGH)**: ESP32 desconectado o en proceso de configuración
- **LED parpadeo momentáneo**: Mensaje MQTT enviado (timbre detectado)

## Mensajes MQTT

- **Topic**: `casa/timbre`
- **Mensaje de conexión**: "ESP32 Timbre conectado" (enviado al iniciar)
- **Mensaje de timbre**: "RING" (enviado cuando se detecta el timbre)
- **Topic de heartbeat**: `casa/heartbeat` (para verificar conexión)

## Solución de Problemas

- Si el LED permanece apagado, verifica la conexión WiFi y que el broker esté funcionando
- Si no se reciben notificaciones, verifica que el ESP32 del broker esté encendido y funcionando
- Para problemas de conexión, verifica que ambos dispositivos estén en la misma red WiFi

