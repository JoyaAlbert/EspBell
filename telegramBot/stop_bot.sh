#!/bin/bash
# Script para detener el bot de Telegram

# Cambiar al directorio del bot
cd /home/joya/Documentos/EspBell/telegramBot

echo "$(date): Deteniendo bot de Telegram..." >> bot.log

# Buscar y terminar todos los procesos del bot
pkill -f "python.*main.py"

# Esperar un momento para que termine limpiamente
sleep 2

# Si aún hay procesos, forzar terminación
pkill -9 -f "python.*main.py"

# Limpiar archivo PID
rm -f bot.pid

echo "$(date): Bot detenido" >> bot.log
