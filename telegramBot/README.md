# Bot de Telegram con MQTT - Bidireccional Multi-Usuario

Este bot se conecta al broker MQTT y permite **comunicación bidireccional** entre Telegram y MQTT. Múltiples usuarios pueden usar el bot simultáneamente.

## 🔄 **Funcionalidad Bidireccional**

- **📥 MQTT → Telegram**: Recibe mensajes del topic MQTT y los envía a Telegram
- **📤 Telegram → MQTT**: Recibe mensajes de Telegram y los publica en el topic MQTT correspondiente
- **🎯 Filtrado personalizado**: Cada usuario interactúa solo con su topic específico
- **🚫 Prevención de bucles**: Evita reenviar mensajes que el propio bot publicó

## 🎯 **Nueva Funcionalidad Multi-Usuario**

- ✅ **Múltiples usuarios simultáneos**: Cada persona puede usar el bot independientemente
- ✅ **Comunicación bidireccional**: Enviar y recibir mensajes
- ✅ **Filtrado personalizado**: Cada usuario interactúa solo con su topic
- ✅ **Gestión independiente**: Las selecciones de cada usuario no interfieren entre sí
- ✅ **Comandos individuales**: Cada chat tiene su propio estado y configuración

## Configuración

1. Instalar dependencias:
```bash
pip install -r requirements.txt
```

2. Configurar variables de entorno en `.env`:
```
TOKEN=tu_token_de_telegram
MQTT_BROKER=192.168.1.210
MQTT_PORT=1883
RECONNECT_DELAY=5
MAX_RECONNECT_ATTEMPTS=20
```

**⚠️ Nota**: Ya no se necesita `CHAT_ID` ya que el bot maneja múltiples chats automáticamente.

### Variables de reconexión:
- `RECONNECT_DELAY`: Segundos entre intentos de reconexión (por defecto: 5)
- `MAX_RECONNECT_ATTEMPTS`: Máximo número de intentos (0 = infinitos, recomendado: 20)

## Uso

1. Ejecutar el bot:
```bash
python main.py
```

2. **Para cada usuario**:
   - Escribir `/start` al bot en Telegram
   - Seleccionar su identidad usando los botones:
     - 👨‍💼 Albert
     - 👩‍💼 Mama  
     - 👧 Ale
   - Recibir solo mensajes del usuario seleccionado

## 📱 Comandos Disponibles

- `/start` - Iniciar configuración del bot
- `/reset` - Cambiar la selección de usuario
- `/status` - Ver el estado actual y usuario seleccionado
- `/help` - Mostrar ayuda completa del bot

## 💬 **Uso de Mensajes**

Una vez configurado, simplemente **escribe mensajes normales** al bot:
- ✅ Tus mensajes se publican automáticamente en tu topic MQTT
- ✅ Recibes mensajes que lleguen a tu topic MQTT
- ✅ Los comandos (que empiezan con `/`) no se publican en MQTT

## Funcionalidad

### 🔄 **Sistema Bidireccional:**
- **📥 MQTT → Telegram**: Los mensajes del topic MQTT se envían a Telegram
- **📤 Telegram → MQTT**: Los mensajes de Telegram se publican en el topic MQTT
- **🎯 Comunicación completa**: Cada usuario puede enviar y recibir mensajes
- **🚫 Sin bucles infinitos**: El bot evita reenviar sus propios mensajes

### 🎯 **Sistema Multi-Usuario:**
- **Usuarios simultáneos**: Múltiples personas pueden usar el bot al mismo tiempo
- **Selección independiente**: Cada usuario elige su identidad por separado
- **Filtrado personalizado**: Solo interactúan con su topic específico:
  - Albert → envía/recibe de `casa/chat/Albert`
  - Mama → envía/recibe de `casa/chat/Mama`
  - Ale → envía/recibe de `casa/chat/Ale`
- **Gestión de estado individual**: Cada chat mantiene su configuración por separado

### 🔄 **Sistema de Reconexión:**
- Detecta desconexiones inesperadas
- Intenta reconectar automáticamente
- Mantiene las suscripciones de todos los usuarios
- Notifica el estado de conexión/reconexión
- Implementa delay progresivo entre intentos
- **Resistencia total**: Si no puede conectar inicialmente, reintenta cada 15 segundos
- **Solo se detiene con Ctrl+C**: El bot nunca se cierra por errores de conexión

### 📱 **Interfaz de Usuario:**
- Botones interactivos para selección de usuario
- Comandos de control (`/start`, `/reset`, `/status`)
- Confirmaciones y notificaciones informativas
- Formato mejorado de mensajes recibidos
- **Filtrado de mensajes**: Extrae automáticamente el contenido después de `:` en mensajes con formato `[PREFIJO]:contenido`

## Características Técnicas

- **Multi-Chat Support**: Gestiona múltiples chats de Telegram simultáneamente
- **Mapeo Chat-Usuario**: Cada chat_id se asocia con un usuario seleccionado
- **Comunicación Bidireccional**: Recibe mensajes MQTT y publica mensajes de Telegram
- **Selección Interactiva**: Usa botones inline de Telegram para la selección
- **Filtrado Inteligente**: Solo procesa mensajes del usuario correspondiente
- **Limpieza de Mensajes**: Extrae automáticamente el contenido útil de mensajes con formato `[PREFIJO]:mensaje`
- **Reconexión Ultra-Robusta**: 
  - Reintenta conexión cada 15 segundos si no puede conectar
  - Nunca se cierra por errores de conexión
  - Solo se detiene con Ctrl+C
- **Prevención de Bucles**: Evita reenviar sus propios mensajes MQTT
- **Polling de Updates**: Procesa respuestas de botones y comandos en tiempo real
- **Manejo de Errores**: Captura y reporta errores de conexión

## Flujo de Uso Multi-Usuario

### **Usuario 1 (Albert):**
1. 🚀 Escribe `/start` al bot
2. 👋 Recibe mensaje de bienvenida
3. 🎯 Selecciona "👨‍💼 Albert"
4. ✅ Confirmación de selección
5. 💬 **Puede enviar mensajes**: Se publican en `casa/chat/Albert`
6. 📥 **Recibe mensajes**: Los que lleguen a `casa/chat/Albert`

### **Usuario 2 (Mama) - Simultáneamente:**
1. 🚀 Escribe `/start` al bot (en su propio chat)
2. 👋 Recibe mensaje de bienvenida
3. 🎯 Selecciona "👩‍💼 Mama"
4. ✅ Confirmación de selección
5. 💬 **Puede enviar mensajes**: Se publican en `casa/chat/Mama`
6. 📥 **Recibe mensajes**: Los que lleguen a `casa/chat/Mama`

### **Resultado:**
- Albert envía/recibe solo en su canal (`casa/chat/Albert`)
- Mama envía/recibe solo en su canal (`casa/chat/Mama`)
- Las comunicaciones son independientes y bidireccionales
- Ambos pueden usar el bot simultáneamente

## Ejemplo de Funcionamiento Bidireccional

### **📤 Telegram → MQTT:**
```
Usuario: Albert (escribe en Telegram)
Mensaje: "hola familia"
↓
Publicado en: casa/chat/Albert
Formato MQTT: [TELEGRAM_@albert]:hola familia
```

### **📥 MQTT → Telegram:**
```
Mensaje MQTT: [ESPBELL_APP_123]:hola Albert
Topic: casa/chat/Albert
↓
Enviado a usuarios que seleccionaron "Albert"
Mensaje en Telegram: "hola Albert" (sin prefijo)
```

### **🔄 Comunicación Completa:**
- Albert puede enviar mensajes desde Telegram que aparecen en MQTT
- Albert recibe en Telegram los mensajes que lleguen a su topic MQTT
- Cada usuario tiene su propio canal de comunicación bidireccional

## Resistencia a Errores

El bot está diseñado para **nunca detenerse** salvo por Ctrl+C:

- ❌ **Broker offline**: Reintenta cada 15 segundos
- ❌ **Red desconectada**: Reintenta cada 15 segundos  
- ❌ **Error de conexión**: Reintenta cada 15 segundos
- ✅ **Solo Ctrl+C detiene el bot**

**Logs típicos:**
```
Error de conexión MQTT: [Errno 113] No route to host
⏳ Esperando 15 segundos antes de reintentar conexión...
🔄 Reintentando conexión al broker MQTT...
Intentando conectar a 192.168.1.210:1883...
```

### **Comportamiento del Bot:**
1. **Inicio sin broker**: Si el broker está offline al iniciar, espera y reintenta cada 15 segundos
2. **Pérdida de conexión**: Si se pierde la conexión durante el funcionamiento, reintenta automáticamente
3. **Notificaciones**: Informa a los usuarios sobre problemas de conexión y reconexiones
4. **Persistencia total**: El bot solo se detiene con `Ctrl+C`, nunca por errores

## Detener el bot

Presionar `Ctrl+C` para detener el bot de forma segura.
