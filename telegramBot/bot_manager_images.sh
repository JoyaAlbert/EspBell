#!/bin/bash
# Script para gestionar el bot con servidor de imágenes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BOT_SCRIPT="$SCRIPT_DIR/main.py"
PID_FILE="$SCRIPT_DIR/bot.pid"
IMAGE_SERVER_PID_FILE="$SCRIPT_DIR/image_server.pid"

case "$1" in
    start)
        echo "🚀 Iniciando bot de Telegram con servidor de imágenes..."
        
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo "❌ El bot ya está ejecutándose (PID: $PID)"
                exit 1
            else
                echo "🧹 Eliminando archivo PID obsoleto..."
                rm -f "$PID_FILE"
            fi
        fi
        
        cd "$SCRIPT_DIR"
        
        # Instalar dependencias si es necesario
        if [ ! -d "venv" ]; then
            echo "📦 Creando entorno virtual..."
            python3 -m venv venv
        fi
        
        # Activar entorno virtual
        source venv/bin/activate
        
        # Instalar/actualizar dependencias
        echo "📋 Instalando dependencias..."
        pip install -r requirements.txt
        
        # Crear carpeta de imágenes
        mkdir -p ./images
        
        # Iniciar bot en segundo plano
        echo "▶️ Iniciando bot..."
        nohup python3 "$BOT_SCRIPT" > bot.log 2>&1 &
        
        # Guardar PID
        echo $! > "$PID_FILE"
        
        sleep 2
        
        if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
            echo "✅ Bot iniciado correctamente (PID: $(cat $PID_FILE))"
            echo "📋 Log: tail -f $SCRIPT_DIR/bot.log"
            echo "🖼️ Servidor de imágenes: http://localhost:8080/status"
        else
            echo "❌ Error iniciando el bot. Revisa el log:"
            echo "   tail -f $SCRIPT_DIR/bot.log"
            rm -f "$PID_FILE"
            exit 1
        fi
        ;;
        
    stop)
        echo "🛑 Deteniendo bot..."
        
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                kill $PID
                echo "⏳ Esperando que el bot se detenga..."
                sleep 3
                
                if ps -p $PID > /dev/null 2>&1; then
                    echo "⚠️ Forzando cierre del bot..."
                    kill -9 $PID
                fi
                
                rm -f "$PID_FILE"
                echo "✅ Bot detenido"
            else
                echo "❌ El bot no está ejecutándose"
                rm -f "$PID_FILE"
            fi
        else
            echo "❌ No se encontró archivo PID. El bot no está ejecutándose."
        fi
        ;;
        
    restart)
        echo "🔄 Reiniciando bot..."
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo "📊 Estado del bot:"
        
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo "✅ Bot ejecutándose (PID: $PID)"
                echo "📋 Log: tail -f $SCRIPT_DIR/bot.log"
                
                # Verificar servidor de imágenes
                if curl -s http://localhost:8080/status > /dev/null 2>&1; then
                    echo "🖼️ Servidor de imágenes: ✅ FUNCIONANDO"
                    echo "   URL: http://localhost:8080/status"
                else
                    echo "🖼️ Servidor de imágenes: ❌ NO RESPONDE"
                fi
                
                # Mostrar información de imágenes
                if [ -d "./images" ]; then
                    IMAGE_COUNT=$(ls -1 ./images | wc -l)
                    echo "📸 Imágenes almacenadas: $IMAGE_COUNT"
                    
                    if [ $IMAGE_COUNT -gt 0 ]; then
                        echo "📁 Carpeta de imágenes: $SCRIPT_DIR/images"
                        echo "   Últimas imágenes:"
                        ls -lt ./images | head -5 | tail -n +2 | while read line; do
                            echo "   - $(echo $line | awk '{print $9}') ($(echo $line | awk '{print $6, $7, $8}'))"
                        done
                    fi
                fi
            else
                echo "❌ Bot no está ejecutándose (PID obsoleto)"
                rm -f "$PID_FILE"
            fi
        else
            echo "❌ Bot no está ejecutándose"
        fi
        ;;
        
    logs)
        echo "📋 Mostrando logs del bot..."
        if [ -f "$SCRIPT_DIR/bot.log" ]; then
            tail -f "$SCRIPT_DIR/bot.log"
        else
            echo "❌ No se encontró archivo de log"
        fi
        ;;
        
    clean-images)
        echo "🧹 Limpiando imágenes antiguas..."
        
        if [ -d "./images" ]; then
            BEFORE_COUNT=$(ls -1 ./images | wc -l)
            
            # Eliminar imágenes más antiguas de 24 horas
            find ./images -type f -mtime +1 -delete
            
            AFTER_COUNT=$(ls -1 ./images | wc -l)
            DELETED=$((BEFORE_COUNT - AFTER_COUNT))
            
            echo "✅ Limpieza completada:"
            echo "   Imágenes antes: $BEFORE_COUNT"
            echo "   Imágenes después: $AFTER_COUNT"
            echo "   Imágenes eliminadas: $DELETED"
        else
            echo "❌ No existe la carpeta de imágenes"
        fi
        ;;
        
    *)
        echo "🤖 Gestor del Bot de Telegram con Servidor de Imágenes"
        echo ""
        echo "Uso: $0 {start|stop|restart|status|logs|clean-images}"
        echo ""
        echo "Comandos:"
        echo "  start         - Iniciar bot y servidor de imágenes"
        echo "  stop          - Detener bot y servidor"
        echo "  restart       - Reiniciar bot"
        echo "  status        - Ver estado del bot y servidor"
        echo "  logs          - Mostrar logs en tiempo real"
        echo "  clean-images  - Limpiar imágenes antiguas manualmente"
        echo ""
        echo "Características:"
        echo "  📸 Servidor de imágenes en puerto 8080"
        echo "  🗑️ Limpieza automática cada 24 horas"
        echo "  🔗 URLs locales para imágenes privadas"
        echo "  📱 Soporte para imágenes desde Telegram"
        echo ""
        exit 1
        ;;
esac
