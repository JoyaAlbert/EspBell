#!/bin/bash

# Script para limpiar archivos temporales y caché

echo "Limpiando archivos temporales y caché..."

# Eliminar archivos de construcción
rm -rf dist
rm -rf out
rm -rf build

# Eliminar archivos temporales de npm
rm -f npm-debug.log
rm -f yarn-debug.log
rm -f yarn-error.log

# Eliminar carpeta node_modules (opcional)
# Descomentar la siguiente línea si quieres eliminar node_modules
# rm -rf node_modules

echo "Limpieza completada."
