#!/bin/bash
# Script de diagnóstico para problemas del servidor de imágenes

echo "🔍 Diagnóstico del Servidor de Imágenes"
echo "========================================"

# Información básica
echo "📍 Directorio actual: $(pwd)"
echo "📅 Fecha: $(date)"
echo ""

# Verificar archivos principales
echo "📁 Verificando archivos principales:"
for file in "main.py" "image_server.py" ".env" "requirements.txt"; do
    if [ -f "$file" ]; then
        echo "✅ $file - EXISTE"
    else
        echo "❌ $file - NO EXISTE"
    fi
done
echo ""

# Verificar carpeta de imágenes
echo "🖼️ Verificando carpeta de imágenes:"
if [ -d "images" ]; then
    echo "✅ Carpeta 'images' existe"
    IMAGE_COUNT=$(ls -1 images/ 2>/dev/null | wc -l)
    echo "📸 Imágenes encontradas: $IMAGE_COUNT"
    
    if [ $IMAGE_COUNT -gt 0 ]; then
        echo "📋 Lista de imágenes:"
        ls -la images/
    fi
else
    echo "❌ Carpeta 'images' no existe"
    echo "🔧 Creando carpeta..."
    mkdir -p images
fi
echo ""

# Verificar estado del bot
echo "🤖 Estado del bot:"
if [ -f "bot.pid" ]; then
    PID=$(cat bot.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Bot ejecutándose (PID: $PID)"
    else
        echo "❌ Bot no está ejecutándose (PID obsoleto)"
        rm -f bot.pid
    fi
else
    echo "❌ Bot no está ejecutándose"
fi
echo ""

# Verificar puerto 8900
echo "🌐 Verificando puerto 8900:"
if netstat -tlnp 2>/dev/null | grep ":8900 " > /dev/null; then
    echo "✅ Puerto 8900 está en uso"
    netstat -tlnp 2>/dev/null | grep ":8900 "
else
    echo "❌ Puerto 8900 no está en uso"
fi
echo ""

# Probar servidor localmente
echo "🧪 Probando servidor localmente:"
if curl -s http://localhost:8900/status > /dev/null 2>&1; then
    echo "✅ Servidor responde en localhost"
    echo "📊 Respuesta del servidor:"
    curl -s http://localhost:8900/status | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8900/status
else
    echo "❌ Servidor no responde en localhost"
fi
echo ""

# Probar acceso a imagen específica
echo "🖼️ Probando acceso a imágenes:"
if [ $IMAGE_COUNT -gt 0 ]; then
    FIRST_IMAGE=$(ls images/ | head -1)
    echo "🎯 Probando imagen: $FIRST_IMAGE"
    
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8900/image/$FIRST_IMAGE)
    echo "📡 Código de respuesta: $RESPONSE_CODE"
    
    if [ "$RESPONSE_CODE" = "200" ]; then
        echo "✅ Imagen accesible correctamente"
    else
        echo "❌ Error accediendo a imagen (código: $RESPONSE_CODE)"
    fi
else
    echo "⚠️ No hay imágenes para probar"
fi
echo ""

# Verificar logs
echo "📋 Verificando logs:"
if [ -f "bot.log" ]; then
    echo "✅ Archivo bot.log existe"
    echo "📏 Tamaño: $(wc -l < bot.log) líneas"
    echo "🔍 Últimas 10 líneas:"
    tail -10 bot.log
else
    echo "❌ No existe archivo bot.log"
fi
echo ""

# Verificar dependencias Python
echo "🐍 Verificando dependencias Python:"
python3 -c "
try:
    import flask
    print('✅ Flask importado correctamente')
except ImportError as e:
    print(f'❌ Error importando Flask: {e}')

try:
    import schedule
    print('✅ Schedule importado correctamente')
except ImportError as e:
    print(f'❌ Error importando Schedule: {e}')

try:
    from image_server import start_image_server
    print('✅ image_server.py importado correctamente')
except ImportError as e:
    print(f'❌ Error importando image_server: {e}')
"
echo ""

# Verificar permisos
echo "🔐 Verificando permisos:"
echo "📁 Permisos del directorio actual:"
ls -la . | head -1
echo "🖼️ Permisos de la carpeta images:"
ls -la images/ | head -1 2>/dev/null || echo "❌ No se pueden verificar permisos de images/"
echo ""

echo "🏁 Diagnóstico completado"
echo ""
echo "💡 Sugerencias para solucionar errores 500:"
echo "   1. Si el servidor no responde: ./bot_manager_images.sh restart"
echo "   2. Si faltan dependencias: pip install -r requirements.txt"
echo "   3. Si hay problemas de permisos: chmod 755 images/"
echo "   4. Ver logs detallados: tail -f bot.log"
echo "   5. Probar manualmente: python3 image_server.py"
