# Gestión de Versiones y Releases de ESPBell

Este documento explica cómo funcionan las versiones y los releases en el proyecto ESPBell.

## Formato de Versiones

Las versiones siguen el formato estándar `vX.Y.Z` (por ejemplo, `v1.2.3`), donde:
- `X` es el número de versión mayor (cambios importantes)
- `Y` es el número de versión menor (nuevas funcionalidades)
- `Z` es el número de revisión (correcciones de errores)

## Cómo Crear un Nuevo Release

Para crear un nuevo release, simplemente incluye la versión en el mensaje del commit cuando haces push a la rama principal:

```bash
git add .
git commit -m "Añadida nueva funcionalidad v1.2.3"
git push origin main
```

**Importante**: El mensaje del commit debe contener la versión en formato `vX.Y.Z`. Esto activará automáticamente el flujo de trabajo de GitHub Actions que:

1. Detectará la versión en el mensaje del commit
2. Actualizará la versión en `package.json`
3. Construirá la aplicación
4. Creará un release en GitHub con la etiqueta `vX.Y.Z`
5. Subirá los archivos ejecutables al release

## Nombres de Archivos

Los archivos generados siempre tendrán el nombre `ESPBell.exe`, `ESPBell.AppImage`, etc., sin incluir la versión en el nombre del archivo. Esto facilita la distribución y evita tener que actualizar los enlaces de descarga en cada release.

## Verificación de Actualizaciones

La aplicación verifica automáticamente si hay nuevas versiones disponibles al iniciar. Si encuentra una versión más reciente que la instalada, mostrará una notificación al usuario con un botón para descargar la actualización.

## Notas Importantes

- El flujo de trabajo de GitHub Actions **solo** se activa cuando:
  - Se hacen cambios en la carpeta `APP`
  - El mensaje del commit contiene una versión en formato `vX.Y.Z`
  
- Puedes hacer commits y pushes normales sin generar releases automáticos, siempre que no incluyas un número de versión en el mensaje del commit.

- La versión de la aplicación se obtiene del mensaje del commit, por lo que es importante seguir el formato correcto (`vX.Y.Z`).

## Ejemplo de Flujo de Trabajo

1. Desarrolla nuevas funcionalidades o correcciones
2. Cuando estés listo para lanzar una nueva versión:
   ```bash
   git add .
   git commit -m "Implementada función de notificaciones v1.2.3"
   git push origin main
   ```
3. GitHub Actions generará automáticamente el release con la versión 1.2.3
4. Los usuarios serán notificados de la nueva versión cuando inicien la aplicación
