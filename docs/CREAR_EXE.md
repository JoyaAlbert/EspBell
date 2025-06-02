# Cómo crear un ejecutable (.exe) para Windows

## Opción 1: Crear un ejecutable en Windows

La manera más sencilla de crear un ejecutable `.exe` para Windows es construir la aplicación directamente en un sistema Windows:

1. Clona o copia este proyecto en una máquina con Windows
2. Instala Node.js en Windows (https://nodejs.org/)
3. Abre una terminal (CMD o PowerShell) en la carpeta del proyecto
4. Ejecuta los siguientes comandos:

```
npm install
npm run build
```

Esto generará archivos `.exe` en la carpeta `dist`. Encontrarás:
- Un instalador en `dist/EspBell MQTT Client-Setup-1.0.0.exe`
- Una versión portable en `dist/win-unpacked/EspBell MQTT Client.exe`

## Opción 2: Usar una máquina virtual Windows

Si solo tienes acceso a Linux pero necesitas crear un ejecutable para Windows:

1. Instala VirtualBox o VMware
2. Crea una máquina virtual con Windows
3. Comparte la carpeta del proyecto con la máquina virtual
4. Sigue los pasos de la Opción 1 dentro de la máquina virtual

## Opción 3: Usar Docker

También puedes usar un contenedor Docker para construir para Windows:

```bash
# Instalar Docker si no lo tienes
sudo apt-get install docker.io

# Construir con Docker (puede tardar varios minutos la primera vez)
docker run --rm -it \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|GH_|GITHUB_|BUILD_') \
  -v ${PWD}:/project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "cd /project && yarn && yarn build:win"
```

Los archivos `.exe` se generarán en la carpeta `dist` igual que en la Opción 1.

## Nota importante

Si estás desarrollando en Linux pero necesitas distribuir para Windows, lo ideal es hacer las pruebas finales en un sistema Windows real para asegurarte de que todo funciona correctamente.
