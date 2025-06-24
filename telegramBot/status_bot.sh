#!/bin/bash
# Script para verificar el estado del bot

cd /home/joya/Documentos/EspBell/telegramBot

if pgrep -f "python.*main.py" > /dev/null; then
    echo "✅ El bot está ejecutándose"
    echo "PIDs: $(pgrep -f 'python.*main.py')"
else
    echo "❌ El bot NO está ejecutándose"
fi

# Mostrar las últimas líneas del log si existe
if [ -f "bot.log" ]; then
    echo ""
    echo "📋 Últimas líneas del log:"
    tail -5 bot.log
fi
