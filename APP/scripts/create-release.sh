#!/bin/bash
# Script para crear un release de ESPBell

# Función para mostrar ayuda
show_help() {
  echo "Uso: $0 <version> [mensaje]"
  echo "  version: Número de versión en formato x.y.z"
  echo "  mensaje: Mensaje opcional para el release (entre comillas)"
  echo ""
  echo "Ejemplo: $0 1.2.3 \"Nueva versión con correcciones importantes\""
  exit 1
}

# Verificar si se proporcionó una versión
if [ $# -lt 1 ]; then
  echo "Error: Debe proporcionar un número de versión."
  show_help
fi

# Verificar el formato de la versión
VERSION=$1
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: El formato de versión debe ser x.y.z (ejemplo: 1.2.3)"
  exit 1
fi

# Mensaje del release (opcional)
if [ $# -gt 1 ]; then
  MESSAGE=$2
else
  MESSAGE="ESPBell versión $VERSION"
fi

# Directorio raíz del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

# Verificar si hay cambios sin commit
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Hay cambios sin commit. ¿Desea continuar? (s/N)"
  read -r RESPONSE
  if [[ ! "$RESPONSE" =~ ^[Ss]$ ]]; then
    echo "Operación cancelada."
    exit 1
  fi
  
  # Hacer commit de los cambios pendientes
  echo "Haciendo commit de los cambios pendientes..."
  git add .
  git commit -m "Preparando release v$VERSION"
fi

# Crear tag de versión
echo "Creando tag v$VERSION..."
git tag -a "v$VERSION" -m "$MESSAGE"

# Hacer push del tag
echo "Haciendo push del tag al repositorio remoto..."
git push origin "v$VERSION"

# Construir la aplicación
echo "Construyendo la aplicación..."
npm run build:all

echo ""
echo "✅ Proceso completado."
echo "Tag v$VERSION creado y enviado al repositorio."
echo "Aplicación construida en la carpeta 'dist'."
echo ""
echo "Para completar el proceso, cree un nuevo release en GitHub:"
echo "1. Vaya a https://github.com/JoyaAlbert/EspBell/releases/new"
echo "2. Seleccione el tag v$VERSION"
echo "3. Título: ESPBell v$VERSION"
echo "4. Descripción: $MESSAGE"
echo "5. Suba los archivos de la carpeta 'dist'"
