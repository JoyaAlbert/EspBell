// Este archivo configura una construcción más simple para Windows
const path = require('path');
const builder = require('electron-builder');
const fs = require('fs');

// Leer la versión actual del package.json
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
const version = packageJson.version;

builder.build({
  targets: builder.Platform.WINDOWS.createTarget(),
  config: {
    appId: "com.espbell.app",
    productName: "ESPBell",
    directories: {
      output: "dist",
      buildResources: "public"
    },
    win: {
      target: ['portable', 'nsis'],
      artifactName: 'ESPBell.${ext}',
      rfc3161TimeStampServer: null,
      timeStampServer: null,
      publisherName: "ESPBell",
      shortcutName: "ESPBell"
    },
    nsis: {
      oneClick: true,
      perMachine: true,
      allowToChangeInstallationDirectory: false,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      runAfterFinish: true
    },
    files: [
      "**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}"
    ]
  }
}).then(() => {
  console.log('Build completed!');
}).catch((error) => {
  console.error('Error during build:', error);
});
