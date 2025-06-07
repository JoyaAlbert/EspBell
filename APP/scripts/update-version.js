const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Este script actualiza la versión en package.json basándose en el último tag de Git.
 * Se debe ejecutar antes de construir la aplicación.
 */

// Función principal
function main() {
  try {
    // Intentar obtener el último tag de Git
    const latestTag = getLatestGitTag();
    
    if (!latestTag) {
      console.log('⚠️ No se encontró ningún tag de Git. Manteniendo la versión actual.');
      return;
    }
    
    // Verificar que el tag tiene el formato correcto (vx.y.z)
    const versionMatch = latestTag.match(/^v(\d+\.\d+\.\d+)$/);
    if (!versionMatch) {
      console.error(`❌ El formato del tag "${latestTag}" no es válido. Debe ser "vx.y.z".`);
      return;
    }
    
    // Extraer la versión sin la "v"
    const versionNumber = versionMatch[1];
    
    // Actualizar el package.json
    updatePackageVersion(versionNumber);
    
    console.log(`✅ Versión actualizada a ${versionNumber} basada en el tag "${latestTag}".`);
  } catch (error) {
    console.error('❌ Error al actualizar la versión:', error.message);
    process.exit(1);
  }
}

// Obtener el último tag de Git
function getLatestGitTag() {
  try {
    // Ejecutar el comando git para obtener el último tag
    const tagOutput = execSync('git describe --tags --abbrev=0 2>/dev/null || echo ""', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'] // Ignorar stderr para evitar errores si no hay tags
    }).trim();
    
    return tagOutput || null;
  } catch (error) {
    console.warn('⚠️ No se pudo obtener el último tag de Git:', error.message);
    return null;
  }
}

// Actualizar la versión en package.json
function updatePackageVersion(version) {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  
  // Leer el archivo package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Actualizar la versión
  packageJson.version = version;
  
  // Escribir el archivo package.json actualizado
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

// Ejecutar la función principal
main();
