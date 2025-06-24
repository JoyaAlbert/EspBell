import os
import requests
import paho.mqtt.client as mqtt
import time
import json
from datetime import datetime, time as dt_time
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

TOKEN = os.getenv('TOKEN')
MQTT_BROKER = os.getenv('MQTT_BROKER')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))

# Configuración de reconexión
RECONNECT_DELAY = int(os.getenv('RECONNECT_DELAY', 5))
MAX_RECONNECT_ATTEMPTS = int(os.getenv('MAX_RECONNECT_ATTEMPTS', 0))

# Configuración de horarios de funcionamiento
HORA_INICIO = dt_time(8, 0)  # 8:00 AM
HORA_FIN = dt_time(23, 0)    # 11:00 PM

# Usuarios disponibles
USUARIOS_DISPONIBLES = ["Albert", "Ale", "Mama"]

# Variables globales para múltiples usuarios
reconnect_count = 0
usuarios_por_chat = {}  # {chat_id: "Albert", chat_id2: "Mama"}
chats_esperando_seleccion = set()  # Set de chat_ids que están esperando selección

def send_telegram_message(message, chat_id=None, reply_markup=None):
    """Envía un mensaje al bot de Telegram"""
    url = f'https://api.telegram.org/bot{TOKEN}/sendMessage'
    
    # Si no se proporciona chat_id, enviar a todos los chats conocidos
    if chat_id is None:
        results = []
        for known_chat_id in usuarios_por_chat.keys():
            data = {'chat_id': known_chat_id, 'text': message}
            if reply_markup:
                data['reply_markup'] = json.dumps(reply_markup)
            
            try:
                response = requests.post(url, data=data)
                if response.status_code == 200:
                    print(f"Mensaje enviado a chat {known_chat_id}: {message}")
                    results.append(response.json())
                else:
                    print(f"Error enviando mensaje a chat {known_chat_id}: {response.status_code}")
            except Exception as e:
                print(f"Error en envío de mensaje a chat {known_chat_id}: {e}")
        return results
    else:
        # Enviar a un chat específico
        data = {'chat_id': chat_id, 'text': message}
        if reply_markup:
            data['reply_markup'] = json.dumps(reply_markup)
        
        try:
            response = requests.post(url, data=data)
            if response.status_code == 200:
                print(f"Mensaje enviado a chat {chat_id}: {message}")
                return response.json()
            else:
                print(f"Error enviando mensaje a chat {chat_id}: {response.status_code}")
        except Exception as e:
            print(f"Error en envío de mensaje a chat {chat_id}: {e}")
    return None

def get_telegram_updates(offset=None):
    """Obtiene actualizaciones del bot de Telegram"""
    url = f'https://api.telegram.org/bot{TOKEN}/getUpdates'
    params = {'timeout': 1}
    if offset:
        params['offset'] = offset
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error obteniendo actualizaciones: {e}")
    return None

def ask_for_user_selection(chat_id):
    """Pregunta al usuario quién es"""
    keyboard = {
        'inline_keyboard': [
            [{'text': '👨‍💼 Albert', 'callback_data': 'user_Albert'}],
            [{'text': '👩‍💼 Mama', 'callback_data': 'user_Mama'}],
            [{'text': '👧 Ale', 'callback_data': 'user_Ale'}]
        ]
    }
    
    message = "👋 ¡Hola! ¿Quién eres?\n\nSelecciona tu nombre para recibir solo los mensajes dirigidos a ti:"
    send_telegram_message(message, chat_id, keyboard)
    chats_esperando_seleccion.add(chat_id)

def process_telegram_updates(client):
    """Procesa las actualizaciones de Telegram para múltiples usuarios"""
    global usuarios_por_chat, chats_esperando_seleccion
    
    updates = get_telegram_updates()
    if not updates or not updates.get('result'):
        return
    
    for update in updates['result']:
        # Procesar mensajes de texto (nuevos usuarios)
        if 'message' in update:
            chat_id = str(update['message']['chat']['id'])
            text = update['message'].get('text', '')
            
            # Si es un comando /start o es un chat nuevo, preguntar por usuario
            if text.startswith('/start') or chat_id not in usuarios_por_chat:
                print(f"Nuevo usuario en chat {chat_id}")
                ask_for_user_selection(chat_id)
        
        # Procesar respuestas de botones
        if 'callback_query' in update:
            callback_data = update['callback_query']['data']
            chat_id = str(update['callback_query']['message']['chat']['id'])
            
            if callback_data.startswith('user_'):
                user = callback_data.replace('user_', '')
                if user in USUARIOS_DISPONIBLES:
                    usuarios_por_chat[chat_id] = user
                    chats_esperando_seleccion.discard(chat_id)
                    
                    # Confirmar selección
                    send_telegram_message(
                        f"✅ ¡Perfecto! Has seleccionado: **{user}**\n\n🔔 Ahora recibirás solo los mensajes del topic `casa/chat/{user}`",
                        chat_id
                    )
                    
                    print(f"Usuario {user} seleccionado para chat {chat_id}")
                    break

def on_connect(client, userdata, flags, rc):
    """Callback cuando se conecta al broker MQTT"""
    global reconnect_count, usuarios_por_chat
    
    if rc == 0:
        print(f"Conectado al broker MQTT en {MQTT_BROKER}:{MQTT_PORT}")
        if reconnect_count > 0:
            send_telegram_message(f"🔄 Reconectado al broker MQTT después de {reconnect_count} intentos")
        reconnect_count = 0
        
        # Suscribirse a todos los topics de usuarios que ya están configurados
        usuarios_suscritos = set(usuarios_por_chat.values())
        for usuario in usuarios_suscritos:
            topic = f"casa/chat/{usuario}"
            client.subscribe(topic)
            print(f"Re-suscrito al topic: {topic}")
        
        if usuarios_suscritos:
            send_telegram_message(f"🔔 Reconectado y suscrito a topics: {', '.join(f'casa/chat/{u}' for u in usuarios_suscritos)}")
    else:
        print(f"Error conectando al broker: {rc}")
        send_telegram_message(f"❌ Error conectando al broker MQTT: {rc}")

def on_message(client, userdata, msg):
    """Callback cuando se recibe un mensaje MQTT"""
    global usuarios_por_chat
    
    topic = msg.topic
    message = msg.payload.decode('utf-8')
    
    print(f"Mensaje recibido de {topic}: {message}")
    
    # Evitar bucle infinito: no reenviar mensajes que vienen de Telegram
    if message.startswith('[TELEGRAM_'):
        print("Mensaje ignorado: viene de Telegram, evitando bucle infinito")
        return
    
    # Extraer solo el contenido después de los dos puntos si existe
    if ':' in message:
        # Buscar el primer ':' y tomar todo lo que está después
        clean_message = message.split(':', 1)[1]
    else:
        # Si no hay ':', usar el mensaje completo
        clean_message = message
    
    # Extraer el nombre del usuario del topic
    user = topic.split('/')[-1]
    
    print(f"Mensaje limpio: {clean_message}")
    
    # Enviar mensaje a todos los chats que tienen seleccionado este usuario
    mensaje_enviado = False
    for chat_id, usuario_seleccionado in usuarios_por_chat.items():
        if user == usuario_seleccionado:
            send_telegram_message(clean_message, chat_id)
            mensaje_enviado = True
            print(f"Mensaje enviado a chat {chat_id} (usuario: {usuario_seleccionado})")
    
    if not mensaje_enviado:
        print(f"Ningún chat está suscrito a mensajes de {user}")

def on_disconnect(client, userdata, rc):
    """Callback cuando se desconecta del broker"""
    global reconnect_count
    if rc != 0:
        print(f"Desconexión inesperada del broker MQTT. Código: {rc}")
        send_telegram_message(f"⚠️ Desconectado del broker MQTT. Intentando reconectar...")
        
        # Intentar reconexión
        while True:
            reconnect_count += 1
            print(f"Intento de reconexión #{reconnect_count}")
            
            try:
                time.sleep(RECONNECT_DELAY)
                client.reconnect()
                break
            except Exception as e:
                print(f"Error en reconexión #{reconnect_count}: {e}")
                if MAX_RECONNECT_ATTEMPTS > 0 and reconnect_count >= MAX_RECONNECT_ATTEMPTS:
                    print("Máximo número de intentos de reconexión alcanzado")
                    send_telegram_message("❌ No se pudo reconectar al broker MQTT")
                    break
                
                # Aumentar el delay progresivamente (hasta un máximo)
                delay = min(RECONNECT_DELAY * reconnect_count, 60)
                print(f"Esperando {delay} segundos antes del siguiente intento...")
                time.sleep(delay)
    else:
        print("Desconectado del broker MQTT (desconexión limpia)")

def is_horario_activo():
    """Verifica si estamos en el horario de funcionamiento del bot"""
    ahora = datetime.now().time()
    return HORA_INICIO <= ahora <= HORA_FIN

def tiempo_hasta_activacion():
    """Calcula cuántos segundos faltan hasta la próxima activación"""
    ahora = datetime.now()
    mañana_8am = ahora.replace(hour=8, minute=0, second=0, microsecond=0)
    
    # Si ya pasó las 8 AM hoy, programar para mañana
    if ahora.time() > HORA_INICIO:
        mañana_8am = mañana_8am.replace(day=mañana_8am.day + 1)
    
    tiempo_espera = (mañana_8am - ahora).total_seconds()
    return max(0, tiempo_espera)

def main():
    """Función principal"""
    global usuarios_por_chat, chats_esperando_seleccion
    
    print("Iniciando bot de Telegram con MQTT para múltiples usuarios...")
    print(f"Horario de funcionamiento: {HORA_INICIO.strftime('%H:%M')} - {HORA_FIN.strftime('%H:%M')}")
    
    # Verificar si estamos en horario activo
    if not is_horario_activo():
        tiempo_espera = tiempo_hasta_activacion()
        horas = int(tiempo_espera // 3600)
        minutos = int((tiempo_espera % 3600) // 60)
        print(f"⏰ Fuera del horario de funcionamiento. Esperando {horas}h {minutos}m hasta las 8:00 AM...")
        
        # Notificar a usuarios si los hay que el bot está en modo nocturno
        if usuarios_por_chat:
            send_telegram_message("🌙 Bot en modo nocturno. Funcionará de 8:00 AM a 11:00 PM")
        
        time.sleep(tiempo_espera)
        print("🌅 ¡Hora de activarse! Iniciando bot...")
    
    # Crear cliente MQTT con configuración de reconexión automática
    client = mqtt.Client()
    client.reconnect_delay_set(min_delay=1, max_delay=120)
    
    # Configurar callbacks
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    
    # Bucle de conexión persistente
    conexion_establecida = False
    
    try:
        while True:  # Bucle infinito hasta Ctrl+C
            try:
                if not conexion_establecida:
                    # Intentar conectar al broker
                    print(f"Intentando conectar a {MQTT_BROKER}:{MQTT_PORT}...")
                    client.connect(MQTT_BROKER, MQTT_PORT, 60)
                    
                    # Iniciar el bucle del cliente MQTT en un hilo separado
                    client.loop_start()
                    
                    # Suscribirse a todos los topics de chat para detectar nuevos mensajes
                    for usuario in USUARIOS_DISPONIBLES:
                        topic = f"casa/chat/{usuario}"
                        client.subscribe(topic)
                        print(f"Suscrito al topic: {topic}")
                    
                    conexion_establecida = True
                    print("Bot funcionando y esperando usuarios...")
                    print("Los usuarios pueden escribir /start para comenzar")
                    print("Presiona Ctrl+C para detener")
                
                # Bucle principal para procesar actualizaciones de Telegram
                last_update_id = 0
                
                while conexion_establecida:
                    # Verificar si estamos fuera del horario de funcionamiento
                    if not is_horario_activo():
                        print("🌙 Fuera del horario de funcionamiento. Deteniendo bot hasta mañana...")
                        if usuarios_por_chat:
                            send_telegram_message("🌙 Bot entrando en modo nocturno. Volveré a las 8:00 AM. ¡Buenas noches!")
                        
                        try:
                            client.loop_stop()
                            client.disconnect()
                        except:
                            pass
                        
                        # Calcular tiempo hasta próxima activación
                        tiempo_espera = tiempo_hasta_activacion()
                        horas = int(tiempo_espera // 3600)
                        minutos = int((tiempo_espera % 3600) // 60)
                        print(f"⏰ Esperando {horas}h {minutos}m hasta las 8:00 AM...")
                        
                        time.sleep(tiempo_espera)
                        print("🌅 ¡Buenos días! Reactivando bot...")
                        
                        # Reiniciar conexión
                        conexion_establecida = False
                        break
                    
                    try:
                        # Obtener actualizaciones de Telegram
                        updates = get_telegram_updates(offset=last_update_id + 1 if last_update_id > 0 else None)
                        
                        if updates and updates.get('result'):
                            for update in updates['result']:
                                last_update_id = max(last_update_id, update['update_id'])
                                
                                # Procesar mensajes de texto (nuevos usuarios)
                                if 'message' in update:
                                    chat_id = str(update['message']['chat']['id'])
                                    text = update['message'].get('text', '')
                                    user_info = update['message']['from']
                                    username = user_info.get('username', user_info.get('first_name', 'Usuario'))
                                    
                                    print(f"Mensaje de @{username} (chat {chat_id}): {text}")
                                    
                                    # Si es un comando /start o es un chat nuevo, preguntar por usuario
                                    if text.startswith('/start') or chat_id not in usuarios_por_chat:
                                        print(f"Nuevo usuario @{username} en chat {chat_id}")
                                        send_telegram_message("🤖 ¡Bienvenido al sistema de chat familiar!", chat_id)
                                        ask_for_user_selection(chat_id)
                                    elif text.startswith('/reset'):
                                        # Permitir cambiar la selección
                                        if chat_id in usuarios_por_chat:
                                            del usuarios_por_chat[chat_id]
                                        ask_for_user_selection(chat_id)
                                    elif text.startswith('/status'):
                                        # Mostrar estado actual
                                        if chat_id in usuarios_por_chat:
                                            usuario_actual = usuarios_por_chat[chat_id]
                                            send_telegram_message(f"📋 Tu usuario actual: **{usuario_actual}**\n\nRecibes mensajes del topic: `casa/chat/{usuario_actual}`\n\nComandos disponibles:\n/reset - Cambiar usuario\n/status - Ver estado\n/help - Mostrar ayuda", chat_id)
                                        else:
                                            send_telegram_message("❌ No tienes un usuario seleccionado. Usa /start para comenzar.", chat_id)
                                    elif text.startswith('/help'):
                                        # Mostrar ayuda
                                        help_message = """
🤖 **Bot de Chat Familiar - Ayuda**

**Comandos disponibles:**
/start - Configurar tu usuario
/reset - Cambiar tu selección de usuario  
/status - Ver tu estado actual
/help - Mostrar esta ayuda

**¿Cómo funciona?**
1. Usa /start para seleccionar tu identidad (Albert, Mama o Ale)
2. Envía mensajes normales y se publicarán en tu topic MQTT
3. Recibirás mensajes que otros envíen a tu topic

**Ejemplo:**
- Si eres "Albert": tus mensajes van a `casa/chat/Albert`
- Recibes mensajes que lleguen a `casa/chat/Albert`

¡Es así de simple! 🏠💬
"""
                                        send_telegram_message(help_message, chat_id)
                                    else:
                                        # Si no es un comando y el usuario ya está configurado, publicar en MQTT
                                        if chat_id in usuarios_por_chat and not text.startswith('/'):
                                            usuario_actual = usuarios_por_chat[chat_id]
                                            topic_mqtt = f"casa/chat/{usuario_actual}"
                                            
                                            # Formatear el mensaje con prefijo identificador
                                            mensaje_mqtt = f"[TELEGRAM_@{username}]:{text}"
                                            
                                            try:
                                                # Publicar mensaje en MQTT
                                                client.publish(topic_mqtt, mensaje_mqtt)
                                                print(f"Mensaje publicado en MQTT - Topic: {topic_mqtt}, Mensaje: {mensaje_mqtt}")
                                                
                                            except Exception as e:
                                                print(f"Error publicando en MQTT: {e}")
                                                send_telegram_message(f"❌ Error enviando mensaje: {e}", chat_id)
                                
                                # Procesar respuestas de botones
                                if 'callback_query' in update:
                                    callback_data = update['callback_query']['data']
                                    chat_id = str(update['callback_query']['message']['chat']['id'])
                                    user_info = update['callback_query']['from']
                                    username = user_info.get('username', user_info.get('first_name', 'Usuario'))
                                    
                                    if callback_data.startswith('user_'):
                                        user = callback_data.replace('user_', '')
                                        if user in USUARIOS_DISPONIBLES:
                                            usuarios_por_chat[chat_id] = user
                                            chats_esperando_seleccion.discard(chat_id)
                                            
                                            # Confirmar selección
                                            send_telegram_message(
                                                f"✅ ¡Perfecto @{username}! Has seleccionado: **{user}**\n\n🔔 Ahora recibirás mensajes del topic `casa/chat/{user}`\n📤 Tus mensajes se publicarán en `casa/chat/{user}`\n\nComandos disponibles:\n/reset - Cambiar usuario\n/status - Ver estado\n/help - Mostrar ayuda\n\n💬 ¡Puedes empezar a escribir mensajes!",
                                                chat_id
                                            )
                                            
                                            print(f"Usuario {user} seleccionado para @{username} (chat {chat_id})")
                        
                        time.sleep(1)  # Evitar hacer demasiadas peticiones
                        
                    except Exception as e:
                        print(f"Error procesando actualizaciones: {e}")
                        time.sleep(2)
                        
            except KeyboardInterrupt:
                print("\nDeteniendo bot...")
                if usuarios_por_chat:
                    send_telegram_message("🤖 Bot detenido por el administrador")
                try:
                    client.disconnect()
                    client.loop_stop()
                except:
                    pass
                break
                
            except Exception as e:
                print(f"Error de conexión MQTT: {e}")
                conexion_establecida = False
                
                # Notificar a usuarios si los hay
                if usuarios_por_chat:
                    send_telegram_message(f"⚠️ Error de conexión al broker MQTT: {e}\n🔄 Reintentando en 15 segundos...")
                
                try:
                    client.loop_stop()
                    client.disconnect()
                except:
                    pass
                
                print("⏳ Esperando 15 segundos antes de reintentar conexión...")
                try:
                    time.sleep(15)
                except KeyboardInterrupt:
                    print("\nDeteniendo bot...")
                    if usuarios_por_chat:
                        send_telegram_message("🤖 Bot detenido por el administrador")
                    break
                
                print("🔄 Reintentando conexión al broker MQTT...")
        
    except KeyboardInterrupt:
        print("\nDeteniendo bot...")
        if usuarios_por_chat:
            send_telegram_message("🤖 Bot detenido por el administrador")
        try:
            client.disconnect()
            client.loop_stop()
        except:
            pass

if __name__ == "__main__":
    main()
