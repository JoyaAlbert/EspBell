#!/bin/bash
# Script para iniciar el bot de Telegram

# Cambiar al directorio del bot
cd /home/joya/Documentos/EspBell/telegramBot

# Verificar si el bot ya está ejecutándose
if pgrep -f "python.*main.py" > /dev/null; then
    echo "$(date): Bot ya está ejecutándose"
    exit 0
fi

# Crear archivo de log si no existe
touch bot.log

# Iniciar el bot en segundo plano
echo "$(date): Iniciando bot de Telegram..." >> bot.log
nohup python3 main.py >> bot.log 2>&1 &

# Guardar el PID del proceso
echo $! > bot.pid

echo "$(date): Bot iniciado con PID $!" >> bot.log
