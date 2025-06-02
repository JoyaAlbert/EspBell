#!/bin/bash
# Script para limpiar archivos temporales y compilar la aplicación para Windows y Linux

# Limpiar archivos anteriores
echo "Limpiando archivos temporales..."
rm -rf dist
rm -rf node_modules/.cache

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  npm install
fi

# Compilar para Windows y Linux
echo "Compilando aplicación para Windows y Linux..."
npm run build:all

echo "Compilación completada. Los archivos están en la carpeta 'dist'."
