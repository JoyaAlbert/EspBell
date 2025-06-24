#!/bin/bash
# Script de gestión del bot de Telegram

BOT_DIR="/home/joya/Documentos/EspBell/telegramBot"
BOT_SCRIPT="main.py"
PID_FILE="$BOT_DIR/bot.pid"
LOG_FILE="$BOT_DIR/bot.log"

cd "$BOT_DIR"

case "$1" in
    start)
        echo "🚀 Iniciando bot de Telegram..."
        if pgrep -f "python.*$BOT_SCRIPT" > /dev/null; then
            echo "⚠️  El bot ya está ejecutándose"
            exit 1
        fi
        
        # Crear log si no existe
        touch "$LOG_FILE"
        
        # Iniciar bot en segundo plano
        nohup python3 "$BOT_SCRIPT" >> "$LOG_FILE" 2>&1 &
        echo $! > "$PID_FILE"
        echo "✅ Bot iniciado con PID $!"
        ;;
        
    stop)
        echo "🛑 Deteniendo bot de Telegram..."
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if kill "$PID" 2>/dev/null; then
                echo "✅ Bot detenido (PID: $PID)"
            else
                echo "⚠️  No se pudo detener el bot con PID $PID"
            fi
            rm -f "$PID_FILE"
        else
            # Buscar y terminar por nombre de proceso
            pkill -f "python.*$BOT_SCRIPT"
            echo "✅ Bot detenido"
        fi
        ;;
        
    restart)
        echo "🔄 Reiniciando bot de Telegram..."
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo "📊 Estado del bot de Telegram:"
        if pgrep -f "python.*$BOT_SCRIPT" > /dev/null; then
            echo "✅ El bot está ejecutándose"
            echo "PIDs: $(pgrep -f "python.*$BOT_SCRIPT")"
        else
            echo "❌ El bot NO está ejecutándose"
        fi
        
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo "📋 Últimas 10 líneas del log:"
            tail -10 "$LOG_FILE"
        fi
        ;;
        
    log)
        if [ -f "$LOG_FILE" ]; then
            echo "📜 Mostrando log completo (Ctrl+C para salir):"
            tail -f "$LOG_FILE"
        else
            echo "❌ No existe archivo de log"
        fi
        ;;
        
    install-cron)
        echo "⏰ Instalando tareas de cron..."
        
        # Verificar si ya existen las tareas
        if crontab -l 2>/dev/null | grep -q "start_bot.sh"; then
            echo "⚠️  Ya existen tareas de cron para el bot"
            echo "Ejecuta 'crontab -e' para editarlas manualmente"
            exit 1
        fi
        
        # Hacer backup del crontab actual
        crontab -l 2>/dev/null > crontab_backup.txt
        
        # Agregar nuevas tareas
        {
            crontab -l 2>/dev/null
            echo "# Bot de Telegram - Auto encendido/apagado"
            echo "0 8 * * * $BOT_DIR/start_bot.sh"
            echo "0 23 * * * $BOT_DIR/stop_bot.sh"
        } | crontab -
        
        echo "✅ Tareas de cron instaladas:"
        echo "   - Encendido: 8:00 AM"
        echo "   - Apagado: 11:00 PM"
        echo "📄 Backup del crontab anterior guardado en: crontab_backup.txt"
        ;;
        
    remove-cron)
        echo "🗑️  Eliminando tareas de cron del bot..."
        crontab -l 2>/dev/null | grep -v "start_bot.sh\|stop_bot.sh" | crontab -
        echo "✅ Tareas de cron eliminadas"
        ;;
        
    *)
        echo "🤖 Script de gestión del Bot de Telegram"
        echo ""
        echo "Uso: $0 {start|stop|restart|status|log|install-cron|remove-cron}"
        echo ""
        echo "Comandos:"
        echo "  start        - Iniciar el bot"
        echo "  stop         - Detener el bot"
        echo "  restart      - Reiniciar el bot"
        echo "  status       - Ver estado del bot"
        echo "  log          - Ver log en tiempo real"
        echo "  install-cron - Instalar programación automática (8AM-11PM)"
        echo "  remove-cron  - Eliminar programación automática"
        echo ""
        echo "Ejemplos:"
        echo "  $0 start     # Iniciar bot manualmente"
        echo "  $0 status    # Ver si está ejecutándose"
        echo "  $0 install-cron  # Programar encendido/apagado automático"
        exit 1
        ;;
esac
