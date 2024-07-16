const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Helper function to copy a file
function copyFileSync(source, target) {
  let targetFile = target;

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

// Build content.js
esbuild.build({
  entryPoints: ['content.js'],
  bundle: true,
  outfile: 'build/content-bundle.js'
}).catch(() => process.exit(1));

// Build background.js
esbuild.build({
  entryPoints: ['background.js'],
  bundle: false,
  outfile: 'build/background-bundle.js'
}).catch(() => process.exit(1));

// Copy customStyles.css
esbuild.build({
  entryPoints: ['customStyles.css'],
  bundle: false,
  outfile: 'build/customStyles.css'
}).catch(() => process.exit(1));

// Copy settings.html
const sourceHtml = path.join(__dirname, 'settings.html');
const targetHtml = path.join(__dirname, 'build', 'settings.html');

try {
  copyFileSync(sourceHtml, targetHtml);
  console.log('settings.html copied to build directory');
} catch (err) {
  console.error('Error copying settings.html:', err);
  process.exit(1);
}

// Copy manifest.json
const sourceManifest = path.join(__dirname, 'manifest.json');
const targetManifest = path.join(__dirname, 'build', 'manifest.json');

try {
  copyFileSync(sourceManifest, targetManifest);
  console.log('manifest.json copied to build directory');
} catch (err) {
  console.error('Error copying manifest.json:', err);
  process.exit(1);
}
