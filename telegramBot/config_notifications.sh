#!/bin/bash
# Script para configurar notificaciones de conexión MQTT del bot

ENV_FILE="/home/joya/Documentos/EspBell/telegramBot/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró el archivo .env en $ENV_FILE"
    echo "💡 Crea el archivo .env a partir de .env.example"
    exit 1
fi

case "$1" in
    enable|on|true)
        echo "🔔 Habilitando notificaciones de conexión MQTT..."
        
        # Verificar si ya existe la línea
        if grep -q "NOTIFY_CONNECTION_ISSUES" "$ENV_FILE"; then
            # Reemplazar línea existente
            sed -i 's/^NOTIFY_CONNECTION_ISSUES=.*/NOTIFY_CONNECTION_ISSUES=true/' "$ENV_FILE"
        else
            # Agregar nueva línea
            echo "NOTIFY_CONNECTION_ISSUES=true" >> "$ENV_FILE"
        fi
        
        echo "✅ Notificaciones de conexión HABILITADAS"
        echo "📋 El bot enviará mensajes cuando se desconecte/reconecte del broker MQTT"
        ;;
        
    disable|off|false)
        echo "🔕 Deshabilitando notificaciones de conexión MQTT..."
        
        # Verificar si ya existe la línea
        if grep -q "NOTIFY_CONNECTION_ISSUES" "$ENV_FILE"; then
            # Reemplazar línea existente
            sed -i 's/^NOTIFY_CONNECTION_ISSUES=.*/NOTIFY_CONNECTION_ISSUES=false/' "$ENV_FILE"
        else
            # Agregar nueva línea
            echo "NOTIFY_CONNECTION_ISSUES=false" >> "$ENV_FILE"
        fi
        
        echo "✅ Notificaciones de conexión DESHABILITADAS"
        echo "📋 El bot NO enviará mensajes de conexión/desconexión MQTT"
        ;;
        
    status)
        echo "📊 Estado actual de las notificaciones:"
        if grep -q "NOTIFY_CONNECTION_ISSUES=true" "$ENV_FILE"; then
            echo "🔔 HABILITADAS - El bot envía notificaciones de conexión"
        elif grep -q "NOTIFY_CONNECTION_ISSUES=false" "$ENV_FILE"; then
            echo "🔕 DESHABILITADAS - El bot NO envía notificaciones de conexión"
        else
            echo "❓ NO CONFIGURADO - Por defecto están deshabilitadas"
            echo "💡 Ejecuta: $0 disable  (para confirmar que estén deshabilitadas)"
        fi
        ;;
        
    *)
        echo "🔧 Configurador de Notificaciones MQTT - Bot de Telegram"
        echo ""
        echo "Uso: $0 {enable|disable|status}"
        echo ""
        echo "Comandos:"
        echo "  enable   - Habilitar notificaciones de conexión MQTT"
        echo "  disable  - Deshabilitar notificaciones de conexión MQTT"  
        echo "  status   - Ver estado actual"
        echo ""
        echo "Ejemplos:"
        echo "  $0 disable  # Desactivar notificaciones (recomendado)"
        echo "  $0 enable   # Activar notificaciones"
        echo "  $0 status   # Ver configuración actual"
        echo ""
        echo "ℹ️  Reinicia el bot después de cambiar la configuración"
        exit 1
        ;;
esac

echo ""
echo "🔄 Para aplicar los cambios, reinicia el bot:"
echo "   ./bot_manager.sh restart"
