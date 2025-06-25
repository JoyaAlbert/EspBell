#!/usr/bin/env python3
"""
Servidor HTTP para servir imágenes de forma privada
Limpia automáticamente las imágenes cada 24 horas
"""

import os
import time
import schedule
from flask import Flask, send_file, abort
from datetime import datetime, timedelta
import threading
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración del servidor
IMAGE_SERVER_PORT = int(os.getenv('IMAGE_SERVER_PORT', 8080))
IMAGE_SERVER_HOST = os.getenv('IMAGE_SERVER_HOST', '0.0.0.0')
IMAGES_FOLDER = os.getenv('IMAGES_FOLDER', './images')

app = Flask(__name__)

def create_images_folder():
    """Crear la carpeta de imágenes si no existe"""
    if not os.path.exists(IMAGES_FOLDER):
        os.makedirs(IMAGES_FOLDER)
        print(f"📁 Carpeta de imágenes creada: {IMAGES_FOLDER}")

def clean_old_images():
    """Eliminar imágenes que tengan más de 24 horas"""
    if not os.path.exists(IMAGES_FOLDER):
        return
    
    now = datetime.now()
    deleted_count = 0
    
    try:
        for filename in os.listdir(IMAGES_FOLDER):
            file_path = os.path.join(IMAGES_FOLDER, filename)
            
            # Verificar que sea un archivo (no directorio)
            if os.path.isfile(file_path):
                # Obtener tiempo de modificación del archivo
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                # Si el archivo tiene más de 24 horas, eliminarlo
                if now - file_time > timedelta(hours=24):
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                        print(f"🗑️ Imagen eliminada: {filename} (creada: {file_time.strftime('%Y-%m-%d %H:%M:%S')})")
                    except Exception as e:
                        print(f"❌ Error eliminando {filename}: {e}")
        
        if deleted_count > 0:
            print(f"✅ Limpieza completada: {deleted_count} imágenes eliminadas")
        else:
            print("✅ Limpieza completada: No hay imágenes antiguas para eliminar")
            
    except Exception as e:
        print(f"❌ Error durante la limpieza de imágenes: {e}")

@app.route('/image/<filename>')
def serve_image(filename):
    """Servir una imagen específica"""
    try:
        file_path = os.path.join(IMAGES_FOLDER, filename)
        
        # Verificar que el archivo existe y está dentro de la carpeta permitida
        if not os.path.exists(file_path) or not os.path.commonpath([IMAGES_FOLDER, file_path]) == IMAGES_FOLDER:
            print(f"❌ Archivo no encontrado o acceso no autorizado: {filename}")
            abort(404)
        
        print(f"📤 Sirviendo imagen: {filename}")
        return send_file(file_path)
        
    except Exception as e:
        print(f"❌ Error sirviendo imagen {filename}: {e}")
        abort(500)

@app.route('/status')
def server_status():
    """Endpoint para verificar el estado del servidor"""
    try:
        # Contar imágenes actuales
        image_count = 0
        if os.path.exists(IMAGES_FOLDER):
            image_count = len([f for f in os.listdir(IMAGES_FOLDER) 
                             if os.path.isfile(os.path.join(IMAGES_FOLDER, f))])
        
        return {
            'status': 'running',
            'timestamp': datetime.now().isoformat(),
            'images_count': image_count,
            'images_folder': IMAGES_FOLDER
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}, 500

def schedule_cleanup():
    """Programar la limpieza automática cada 24 horas"""
    # Programar limpieza diaria a las 3:00 AM
    schedule.every().day.at("03:00").do(clean_old_images)
    
    # También ejecutar limpieza cada 24 horas desde el inicio
    schedule.every(24).hours.do(clean_old_images)
    
    print("⏰ Limpieza automática programada:")
    print("   - Cada día a las 3:00 AM")
    print("   - Cada 24 horas desde el inicio")
    
    # Ejecutar limpieza inicial
    print("🧹 Ejecutando limpieza inicial...")
    clean_old_images()

def run_scheduler():
    """Ejecutar el programador en un hilo separado"""
    while True:
        schedule.run_pending()
        time.sleep(60)  # Verificar cada minuto

def start_image_server():
    """Iniciar el servidor de imágenes"""
    print(f"🖼️ Iniciando servidor de imágenes...")
    print(f"   Host: {IMAGE_SERVER_HOST}")
    print(f"   Puerto: {IMAGE_SERVER_PORT}")
    print(f"   Carpeta de imágenes: {IMAGES_FOLDER}")
    
    # Crear carpeta de imágenes
    create_images_folder()
    
    # Programar limpieza automática
    schedule_cleanup()
    
    # Iniciar el programador en un hilo separado
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    # Iniciar el servidor Flask
    app.run(
        host=IMAGE_SERVER_HOST,
        port=IMAGE_SERVER_PORT,
        debug=False,
        use_reloader=False
    )

if __name__ == "__main__":
    start_image_server()
