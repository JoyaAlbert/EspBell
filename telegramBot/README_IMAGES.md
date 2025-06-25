# 📸 Bot de Telegram con Servidor de Imágenes

## 🚀 Nuevas Funcionalidades

### ✨ Envío de Imágenes
- **Recibe imágenes** de Telegram y las guarda en el servidor local
- **Genera URLs privadas** para acceder a las imágenes
- **Envía las URLs por MQTT** en lugar de las imágenes directamente
- **Soporte para captions** en las imágenes

### 🖼️ Servidor HTTP Local
- **Puerto configurable** (por defecto 8080)
- **Acceso privado** - solo en la red local
- **URLs del formato**: `http://servidor:8080/image/filename.jpg`
- **Endpoint de estado**: `http://servidor:8080/status`

### 🗑️ Limpieza Automática
- **Elimina imágenes automáticamente** después de 24 horas
- **Programación flexible**: 3:00 AM y cada 24h desde inicio
- **Limpieza manual** disponible con comando

## 📋 Configuración

### Variables de Entorno (.env)
```bash
# Configuración del servidor de imágenes
IMAGE_SERVER_PORT=8080
IMAGE_SERVER_HOST=0.0.0.0
IMAGES_FOLDER=./images
SERVER_BASE_URL=http://192.168.1.210:8080
```

### Dependencias Nuevas
```bash
flask
schedule
threading
```

## 🎮 Uso

### Gestión del Bot
```bash
# Nuevo gestor con soporte de imágenes
./bot_manager_images.sh start    # Iniciar bot + servidor
./bot_manager_images.sh stop     # Detener todo
./bot_manager_images.sh status   # Ver estado completo
./bot_manager_images.sh logs     # Ver logs en tiempo real
./bot_manager_images.sh clean-images  # Limpiar manualmente
```

### Envío de Imágenes
1. **Configurar usuario** con `/start`
2. **Enviar imagen** directamente en Telegram
3. **Opcional**: Agregar caption a la imagen
4. **El bot confirma** el envío con la URL

### Formato de Mensajes MQTT
```
# Imagen sin caption
[TELEGRAM_@usuario]:📸 Imagen compartida
🔗 http://servidor:8080/image/usuario_20240625_143022_abc123.jpg

# Imagen con caption
[TELEGRAM_@usuario]:📸 ¡Mira esta foto!
🔗 http://servidor:8080/image/usuario_20240625_143022_abc123.jpg
```

## 🔧 Arquitectura

### Componentes
1. **main.py** - Bot principal con manejo de imágenes
2. **image_server.py** - Servidor HTTP para imágenes
3. **bot_manager_images.sh** - Gestor completo del sistema

### Flujo de Imágenes
```
Telegram → Download → Save Local → Generate URL → Send via MQTT
```

### Estructura de Archivos
```
telegramBot/
├── main.py                    # Bot principal
├── image_server.py           # Servidor de imágenes
├── bot_manager_images.sh     # Gestor completo
├── images/                   # Carpeta de imágenes
│   ├── usuario_timestamp_id.jpg
│   └── ...
└── requirements.txt          # Dependencias actualizadas
```

## 🛡️ Seguridad

### Características de Seguridad
- **URLs privadas** - Solo accesibles en red local
- **Nombres únicos** - Timestamp + UUID para evitar colisiones
- **Validación de paths** - Previene acceso a archivos fuera de la carpeta
- **Limpieza automática** - Elimina evidencia después de 24h

### Acceso a Imágenes
- **Red local**: `http://192.168.1.210:8080/image/imagen.jpg`
- **Endpoint de estado**: `http://192.168.1.210:8080/status`
- **Sin acceso externo** (no hay port forwarding)

## 📊 Monitoreo

### Logs Incluyen
- Descarga y guardado de imágenes
- URLs generadas
- Limpieza automática
- Estado del servidor HTTP

### Comandos de Monitoreo
```bash
./bot_manager_images.sh status     # Estado completo
curl http://localhost:8080/status  # Estado del servidor
ls -la ./images/                   # Ver imágenes almacenadas
```

## 🔄 Migración

### Desde Bot Anterior
1. **Mantener configuración** existente en `.env`
2. **Instalar dependencias** nuevas: `pip install -r requirements.txt`
3. **Usar nuevo gestor**: `./bot_manager_images.sh start`
4. **Verificar funcionamiento**: `./bot_manager_images.sh status`

### Compatibilidad
- ✅ **Mensajes de texto** - Funcionan igual que antes
- ✅ **Comandos** - Todos los comandos existentes
- ✅ **MQTT** - Misma configuración de topics
- ➕ **Imágenes** - Nueva funcionalidad

## 🚨 Troubleshooting

### Problemas Comunes
```bash
# El servidor no inicia
sudo netstat -tlnp | grep 8080  # Verificar puerto ocupado

# Imágenes no se guardan
ls -la ./images/                 # Verificar permisos de carpeta

# URLs no funcionan
curl http://localhost:8080/status # Verificar servidor HTTP
```

### Logs Útiles
```bash
tail -f bot.log                  # Log del bot
./bot_manager_images.sh logs     # Logs en tiempo real
```

## 📝 Ejemplo de Uso Completo

1. **Iniciar sistema**:
   ```bash
   ./bot_manager_images.sh start
   ```

2. **En Telegram**:
   - Enviar `/start`
   - Seleccionar usuario (ej: Albert)
   - Enviar imagen con caption: "¡Hola familia!"

3. **Resultado en MQTT**:
   ```
   Topic: casa/chat/Albert
   Message: [TELEGRAM_@albert]:📸 ¡Hola familia!
   🔗 http://192.168.1.210:8080/image/albert_20240625_143022_abc123.jpg
   ```

4. **Verificar imagen**:
   ```bash
   curl http://192.168.1.210:8080/image/albert_20240625_143022_abc123.jpg
   ```

¡El sistema está listo para manejar imágenes de forma privada y segura! 🎉
