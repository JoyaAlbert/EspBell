# Test de Funcionalidad: Ventana se Muestra al Recibir Mensajes de Chat

## ✅ Implementaciones Realizadas

### 1. **Función showAndFocusWindow() en main.js**
- Muestra la ventana si está oculta
- Restaura la ventana si está minimizada
- Enfoca la ventana 
- Pone la ventana temporalmente en primer plano (always on top)
- Hace parpadear la ventana en la barra de tareas

### 2. **Modificación del handler de mensajes MQTT**
- Detecta mensajes en topics de chat (`casa/chat/*`)
- Llama a `showAndFocusWindow()` cuando recibe mensajes de chat
- Envía evento específico `chat-message-received` al renderer

### 3. **Actualización del preload.js**
- Agregado listener para `chat-message-received`
- Actualizada función de limpieza de listeners

### 4. **Mejoras en el renderer**
- Listener específico para eventos de chat que muestra la ventana
- Sonido de notificación diferenciado para mensajes de chat
- Notificaciones del navegador para mensajes de chat

## 🔧 Funcionalidades Incluidas

### **Cuando llegue un mensaje de chat:**
1. **Ventana minimizada**: Se restaura automáticamente
2. **Ventana oculta**: Se muestra automáticamente  
3. **Ventana en segundo plano**: Se enfoca y trae al frente
4. **Parpadeo en barra de tareas**: Para llamar atención
5. **Sonido de notificación**: Tono suave diferente al timbre
6. **Notificación del navegador**: Si están habilitadas

### **Comportamiento por Usuario:**
- **Albert**: Mensajes en `casa/chat/Albert` muestran la ventana
- **Ale**: Mensajes en `casa/chat/Ale` muestran la ventana  
- **Mama**: Mensajes en `casa/chat/Mama` muestran la ventana

### **Prevención de Bucles:**
- No muestra la ventana para mensajes enviados desde la propia app
- Identifica mensajes propios por el prefijo `[ESPBELL_APP_]`

## 🎯 Casos de Uso

### **Desde Telegram Bot:**
```
Topic: casa/chat/Albert
Mensaje: "[TELEGRAM_@JoyaAP]:Hola familia"
Resultado: ✅ Ventana se muestra y enfoca
```

### **Desde ESP32/Arduino:**
```
Topic: casa/chat/Albert  
Mensaje: "Mensaje del ESP32"
Resultado: ✅ Ventana se muestra y enfoca
```

### **Desde otra aplicación MQTT:**
```
Topic: casa/chat/Mama
Mensaje: "Test desde app externa"
Resultado: ✅ Ventana se muestra y enfoca
```

### **Desde la propia app (NO debe mostrar):**
```
Topic: casa/chat/Albert
Mensaje: "[ESPBELL_APP_1234567890]:Mi mensaje"
Resultado: ❌ NO muestra ventana (evita bucle)
```

## 🔄 Flujo Completo

1. **Mensaje MQTT llega** al topic `casa/chat/{usuario}`
2. **mqttManager detecta** el mensaje en main.js
3. **Se verifica** que no sea un mensaje propio  
4. **Se llama** a `showAndFocusWindow()`
5. **La ventana** se muestra/restaura/enfoca
6. **Se envía evento** `chat-message-received` al renderer
7. **El renderer reproduce** sonido de notificación
8. **Se muestra** notificación del navegador (si está habilitada)
9. **El mensaje aparece** en el chat correspondiente

## 🚀 Para Probar

### **Desde línea de comandos (mosquitto):**
```bash
# Enviar mensaje a Albert
mosquitto_pub -h 192.168.1.210 -t "casa/chat/Albert" -m "Prueba desde terminal"

# Enviar mensaje a Mama  
mosquitto_pub -h 192.168.1.210 -t "casa/chat/Mama" -m "Otro mensaje de prueba"
```

### **Desde el Bot de Telegram:**
1. Enviar `/start` al bot
2. Seleccionar un usuario  
3. Escribir cualquier mensaje
4. La app debe mostrarse automáticamente

### **Desde otra app MQTT:**
1. Conectar a `192.168.1.210:1883`
2. Publicar en `casa/chat/Albert` 
3. La app debe mostrarse automáticamente

## ⚙️ Configuración del Sistema

La función funciona en:
- ✅ **Windows**: `flashFrame()` hace parpadear en la barra de tareas
- ✅ **macOS**: `show()`, `restore()`, `focus()` funcionan normalmente  
- ✅ **Linux**: Depende del entorno de escritorio, pero debería funcionar

## 📝 Notas Importantes

- La ventana se pone en `always on top` por 2 segundos solamente
- El sonido de chat es diferente y más suave que el del timbre
- Los mensajes propios se ignoran para evitar bucles infinitos
- Funciona tanto si la app está minimizada como si está oculta
- Compatible con todos los formatos de mensaje (Telegram, ESP32, etc.)
