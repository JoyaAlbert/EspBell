# Bot de Telegram con MQTT - Múltiples Usuarios con Programación Horaria

Bot de Telegram que permite a múltiples usuarios (Albert, Ale, Mama) comunicarse a través de MQTT con programación automática de encendido/apagado.

## 🕐 Programación Horaria

El bot está configurado para funcionar automáticamente:
- **Encendido**: 8:00 AM
- **Apagado**: 11:00 PM (23:00)

## 🚀 Instalación y Configuración

### Requisitos
```bash
pip install -r requirements.txt
```

### Variables de Entorno
Crear archivo `.env` con:
```env
TOKEN=tu_token_de_telegram
MQTT_BROKER=ip_del_broker
MQTT_PORT=1883

# Configuración de notificaciones (NUEVO)
NOTIFY_CONNECTION_ISSUES=false
```

### 🔕 **Control de Notificaciones MQTT** (NUEVO)
Por defecto, el bot **NO** envía notificaciones cuando:
- Se pierde la conexión al broker MQTT
- Se intenta reconectar al broker
- Hay errores de conexión

**Para activar estas notificaciones:**
```env
NOTIFY_CONNECTION_ISSUES=true
```

**Para mantenerlas desactivadas (recomendado):**
```env
NOTIFY_CONNECTION_ISSUES=false
```

## 🎯 Opciones de Programación Automática

### Opción 1: Usando Crontab (Recomendada)

#### Instalación Automática
```bash
./bot_manager.sh install-cron
```

#### Instalación Manual
1. Editar crontab:
```bash
crontab -e
```

2. Agregar estas líneas:
```bash
# Encender bot a las 8:00 AM
0 8 * * * /home/joya/Documentos/EspBell/telegramBot/start_bot.sh

# Apagar bot a las 11:00 PM  
0 23 * * * /home/joya/Documentos/EspBell/telegramBot/stop_bot.sh
```

### Opción 2: Auto-programación en el Código
El código Python ya incluye lógica para auto-detenerse y reactivarse según el horario configurado.

## 🛠️ Scripts de Gestión

### Script Principal de Gestión
```bash
./bot_manager.sh [comando]
```

**Comandos disponibles:**
- `start` - Iniciar el bot
- `stop` - Detener el bot  
- `restart` - Reiniciar el bot
- `status` - Ver estado del bot
- `log` - Ver log en tiempo real
- `install-cron` - Instalar programación automática
- `remove-cron` - Eliminar programación automática

### Scripts Individuales
- `start_bot.sh` - Iniciar bot en segundo plano
- `stop_bot.sh` - Detener bot limpiamente
- `status_bot.sh` - Verificar estado del bot

## 📋 Ejemplos de Uso

### Gestión Manual
```bash
# Ver estado actual
./bot_manager.sh status

# Iniciar manualmente
./bot_manager.sh start

# Ver logs en tiempo real
./bot_manager.sh log

# Detener bot
./bot_manager.sh stop
```

### Programación Automática
```bash
# Instalar programación automática (8AM-11PM)
./bot_manager.sh install-cron

# Verificar tareas programadas
crontab -l

# Eliminar programación automática
./bot_manager.sh remove-cron
```

## 🤖 Uso del Bot

### Comandos de Telegram
- `/start` - Configurar usuario inicial
- `/reset` - Cambiar selección de usuario
- `/status` - Ver estado actual
- `/help` - Mostrar ayuda

### Flujo de Uso
1. El usuario envía `/start` al bot
2. Selecciona su identidad (Albert, Ale, Mama)
3. Sus mensajes se publican en `casa/chat/{usuario}`
4. Recibe mensajes dirigidos a su topic

## 📁 Archivos Generados

- `bot.log` - Log del bot
- `bot.pid` - PID del proceso (cuando está activo)
- `status.log` - Log de verificaciones de estado
- `crontab_backup.txt` - Backup del crontab original

## 🔧 Configuración Avanzada

### Cambiar Horarios
Editar en `main.py`:
```python
HORA_INICIO = dt_time(8, 0)  # 8:00 AM
HORA_FIN = dt_time(23, 0)    # 11:00 PM
```

### Solo Días Laborables
En crontab:
```bash
# Solo lunes a viernes
0 8 * * 1-5 /path/to/start_bot.sh
0 23 * * 1-5 /path/to/stop_bot.sh
```

### Verificaciones Periódicas
Agregar al crontab:
```bash
# Verificar estado cada hora
0 8-22 * * * /path/to/status_bot.sh >> /path/to/status.log
```

## 🔄 Funcionalidad Bidireccional Original

- **📥 MQTT → Telegram**: Recibe mensajes del topic MQTT y los envía a Telegram
- **📤 Telegram → MQTT**: Recibe mensajes de Telegram y los publica en el topic MQTT correspondiente
- **🎯 Filtrado personalizado**: Cada usuario interactúa solo con su topic específico
- **🚫 Prevención de bucles**: Evita reenviar mensajes que el propio bot publicó

## 🎯 Sistema Multi-Usuario

- ✅ **Múltiples usuarios simultáneos**: Cada persona puede usar el bot independientemente
- ✅ **Comunicación bidireccional**: Enviar y recibir mensajes
- ✅ **Filtrado personalizado**: Cada usuario interactúa solo con su topic
- ✅ **Gestión independiente**: Las selecciones de cada usuario no interfieren entre sí
- ✅ **Comandos individuales**: Cada chat tiene su propio estado y configuración
