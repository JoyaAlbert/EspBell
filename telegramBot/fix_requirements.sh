#!/bin/bash
# Script para solucionar problemas de dependencias en el servidor

echo "🔧 Solucionando problemas de dependencias..."

# Ir al directorio del bot
cd "$(dirname "$0")"

echo "📍 Directorio actual: $(pwd)"

# Backup del requirements.txt actual
if [ -f "requirements.txt" ]; then
    echo "💾 Haciendo backup del requirements.txt actual..."
    cp requirements.txt requirements.txt.backup
    echo "✅ Backup guardado como requirements.txt.backup"
fi

# Crear requirements.txt limpio
echo "✨ Creando requirements.txt limpio..."
cat > requirements.txt << 'EOF'
requests
python-dotenv
paho-mqtt
flask
schedule
EOF

echo "✅ requirements.txt creado correctamente"

# Mostrar contenido
echo "📋 Contenido del nuevo requirements.txt:"
cat requirements.txt

# Limpiar caché de pip
echo "🧹 Limpiando caché de pip..."
pip cache purge 2>/dev/null || pip3 cache purge 2>/dev/null || echo "Cache purge no disponible, continuando..."

# Instalar dependencias una por una para detectar problemas
echo "📦 Instalando dependencias una por una..."

PACKAGES=("requests" "python-dotenv" "paho-mqtt" "flask" "schedule")

for package in "${PACKAGES[@]}"; do
    echo "📥 Instalando $package..."
    if pip install "$package" --no-cache-dir; then
        echo "✅ $package instalado correctamente"
    else
        echo "❌ Error instalando $package"
        if pip3 install "$package" --no-cache-dir; then
            echo "✅ $package instalado con pip3"
        else
            echo "❌ Error instalando $package con pip3"
        fi
    fi
done

echo ""
echo "🎉 Proceso completado"
echo "💡 Si aún hay problemas, ejecuta:"
echo "   pip install --upgrade pip"
echo "   pip install -r requirements.txt --no-cache-dir"
