const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure the build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('build directory created');
}

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

// Helper function to copy a folder
function copyFolderRecursiveSync(source, target) {
  let files = [];

  // Check if folder needs to be created or integrated
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        copyFileSync(curSource, curTarget);
      }
    });
  }
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

// Copy imgs folder
const sourceImgs = path.join(__dirname, 'imgs');
const targetImgs = path.join(__dirname, 'build', 'imgs');

try {
  copyFolderRecursiveSync(sourceImgs, targetImgs);
  console.log('imgs folder copied to build directory');
} catch (err) {
  console.error('Error copying imgs folder:', err);
  process.exit(1);
}

// Copy Toastify CSS file
const sourceToastifyCss = path.join(__dirname, 'node_modules', 'toastify-js', 'src', 'toastify.css');
const targetToastifyCss = path.join(__dirname, 'build', 'toastify.css');

try {
  copyFileSync(sourceToastifyCss, targetToastifyCss);
  console.log('toastify.css copied to build directory');
} catch (err) {
  console.error('Error copying toastify.css:', err);
  process.exit(1);
}

// Copy Tippy CSS file
const sourceTippyCss = path.join(__dirname, 'node_modules', 'tippy.js', 'dist', 'tippy.css');
const targetTippyCss = path.join(__dirname, 'build', 'tippy.css');

try {
  copyFileSync(sourceTippyCss, targetTippyCss);
  console.log('tippy.css copied to build directory');
} catch (err) {
  console.error('Error copying tippy.css:', err);
  process.exit(1);
}