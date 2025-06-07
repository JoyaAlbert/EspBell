# Gestión de Versiones y Releases de ESPBell

Este documento explica cómo funcionan las versiones y los releases en el proyecto ESPBell.

## Formato de Versiones

Las versiones siguen el formato estándar `x.y.z` (por ejemplo, `1.2.3`), donde:
- `x` es el número de versión mayor (cambios importantes)
- `y` es el número de versión menor (nuevas funcionalidades)
- `z` es el número de revisión (correcciones de errores)

## Cómo Crear un Nuevo Release

Para crear un nuevo release, utiliza el siguiente comando:

```bash
npm run release 1.2.3 "Descripción del release"
```

Donde:
- `1.2.3` es el número de versión que quieres usar
- `"Descripción del release"` es un mensaje opcional que describe los cambios

Este comando hará lo siguiente:
1. Creará un tag de Git con el formato `v1.2.3`
2. Enviará el tag al repositorio remoto
3. Construirá la aplicación con esta versión
4. Te dará instrucciones para subir los archivos a GitHub

## Nombres de Archivos

Los archivos generados siempre tendrán el nombre `ESPBell.exe`, `ESPBell.AppImage`, etc., sin incluir la versión en el nombre del archivo. Esto facilita la distribución y evita tener que actualizar los enlaces de descarga en cada release.

## Verificación de Actualizaciones

La aplicación verifica automáticamente si hay nuevas versiones disponibles al iniciar. Si encuentra una versión más reciente que la instalada, mostrará una notificación al usuario con un botón para descargar la actualización.

## Notas Importantes

- El proceso de actualización no es automático. Cuando el usuario hace clic en el botón de descarga, se le redirige a la página de GitHub donde puede descargar manualmente la nueva versión.
- La versión de la aplicación se obtiene del tag de Git más reciente, por lo que es importante seguir el formato correcto (`vx.y.z`) al crear tags.
- Para que la verificación de actualizaciones funcione correctamente, debes crear releases oficiales en GitHub utilizando los tags generados.

## Ejemplo de Flujo de Trabajo

1. Desarrolla nuevas funcionalidades o correcciones
2. Cuando estés listo para lanzar una nueva versión, ejecuta:
   ```bash
   npm run release 1.2.3 "Nueva versión con correcciones importantes"
   ```
3. Sigue las instrucciones para completar el release en GitHub
4. Los usuarios serán notificados de la nueva versión cuando inicien la aplicación
