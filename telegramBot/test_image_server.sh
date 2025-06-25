#!/bin/bash
# Script para probar el servidor de imágenes con máxima compatibilidad

echo "🧪 Probando Servidor de Imágenes - Acceso Universal"
echo "=================================================="

SERVER_URL="http://192.168.1.61:8900"
LOCAL_URL="http://localhost:8900"

echo "🌐 Probando desde servidor local:"
echo "--------------------------------"

# Probar ping básico
echo "📡 Ping test:"
curl -s "$LOCAL_URL/ping" && echo " ✅ Ping OK" || echo " ❌ Ping FAIL"

# Probar endpoint de test
echo "🧪 Test endpoint:"
curl -s "$LOCAL_URL/test" | python3 -c "import sys,json; print('✅ Test OK:', json.load(sys.stdin)['message'])" 2>/dev/null || echo "❌ Test FAIL"

# Probar status
echo "📊 Status endpoint:"
curl -s "$LOCAL_URL/status" | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(f'✅ Status: {data[\"status\"]}')
print(f'📸 Imágenes: {data[\"images_count\"]}')
print(f'🔧 CORS: {data[\"server_info\"][\"cors_enabled\"]}')
" 2>/dev/null || echo "❌ Status FAIL"

echo ""
echo "🌍 Probando acceso externo simulado:"
echo "-----------------------------------"

# Simular acceso externo con headers CORS
echo "🔗 CORS headers test:"
curl -s -H "Origin: http://example.com" -H "Access-Control-Request-Method: GET" -X OPTIONS "$LOCAL_URL/status" -I | grep -i "access-control" | head -3

echo ""
echo "📸 Probando imágenes:"
echo "-------------------"

# Listar imágenes disponibles
if [ -d "images" ]; then
    IMAGE_COUNT=$(ls -1 images/ 2>/dev/null | wc -l)
    echo "📁 Imágenes encontradas: $IMAGE_COUNT"
    
    if [ $IMAGE_COUNT -gt 0 ]; then
        FIRST_IMAGE=$(ls images/ | head -1)
        echo "🎯 Probando imagen: $FIRST_IMAGE"
        
        # Probar acceso a imagen con headers CORS
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: http://example.com" "$LOCAL_URL/image/$FIRST_IMAGE")
        echo "📡 Código HTTP: $HTTP_CODE"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Imagen accesible correctamente"
            
            # Verificar headers CORS en la respuesta de imagen
            echo "🔍 Headers CORS de la imagen:"
            curl -s -I -H "Origin: http://example.com" "$LOCAL_URL/image/$FIRST_IMAGE" | grep -i "access-control"
        else
            echo "❌ Error accediendo a imagen (HTTP: $HTTP_CODE)"
        fi
    else
        echo "⚠️ No hay imágenes para probar"
    fi
else
    echo "❌ Carpeta 'images' no existe"
fi

echo ""
echo "🔥 URLs para probar desde navegador externo:"
echo "==========================================="
echo "📊 Status: $SERVER_URL/status"
echo "🧪 Test: $SERVER_URL/test"
echo "📡 Ping: $SERVER_URL/ping"

if [ -d "images" ] && [ $(ls -1 images/ 2>/dev/null | wc -l) -gt 0 ]; then
    FIRST_IMAGE=$(ls images/ | head -1)
    echo "📸 Imagen: $SERVER_URL/image/$FIRST_IMAGE"
fi

echo ""
echo "💡 Para probar desde cualquier dispositivo en la red:"
echo "   curl $SERVER_URL/ping"
echo "   curl $SERVER_URL/status"
echo ""
echo "🔧 Si aún hay problemas:"
echo "   1. Verificar firewall: sudo ufw status"
echo "   2. Verificar puerto: netstat -tlnp | grep 8900"
echo "   3. Reiniciar servidor: ./bot_manager_images.sh restart"
