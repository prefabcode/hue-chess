
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`${dir} directory created`);
  }
}

function copyFileSync(source, target) {
  let targetFile = target;
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
  let files = [];
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }
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

const buildDirChrome = path.join(__dirname, 'build-chrome');
const buildDirFirefox = path.join(__dirname, 'build-firefox');

const buildTarget = process.argv[2];
const chromeBrowser = 'chrome';
const firefoxBrowser = 'firefox';

function buildForChrome() {
  ensureDirSync(buildDirChrome);
  console.log('chrome directory exists');

  esbuild.build({
    entryPoints: ['content.js'],
    bundle: true,
    outfile: path.join(buildDirChrome, 'content-bundle.js'),
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ||
        'development')
    }
  }).catch(() => process.exit(1));
  console.log('content-bundle.js created for chrome');

  esbuild.build({
    entryPoints: ['background-chrome.js'],
    bundle: false,
    outfile: path.join(buildDirChrome, 'background-bundle.js')
  }).catch(() => process.exit(1));
  console.log('background-bundle.js created for chrome');

  esbuild.build({
    entryPoints: ['customStyles.css'],
    bundle: false,
    outfile: path.join(buildDirChrome, 'customStyles.css')
  }).catch(() => process.exit(1));
  console.log('customStyles.css copied to chrome build directory');

  ['settings.html', 'perks.html'].forEach(file => {
    const sourceFile = path.join(__dirname, file);
    copyFileSync(sourceFile, path.join(buildDirChrome, file));
  });
  console.log('html files copied into chrome build directory');

  copyFileSync(path.join(__dirname, 'chrome-manifest.json'),
    path.join(buildDirChrome, 'manifest.json'));
  console.log('copied manifest file into chrome build directory');

  copyFolderRecursiveSync(path.join(__dirname, 'imgs'),
    path.join(buildDirChrome, 'imgs'));
  console.log('copied images into chrome build directory');

  const sourceToastifyCss = path.join(__dirname, 'node_modules',
    'toastify-js', 'src', 'toastify.css');
  copyFileSync(sourceToastifyCss, path.join(buildDirChrome, 'toastify.css'))
  console.log('copied toastify.css into chrome build directory');

  const sourceTippyCss = path.join(__dirname, 'node_modules', 'tippy.js',
    'dist', 'tippy.css');
  copyFileSync(sourceTippyCss, path.join(buildDirChrome, 'tippy.css'));
  console.log('copied tippy.css into chrome build directory');
}

function buildForFirefox() {
  ensureDirSync(buildDirFirefox);
  console.log('firefox directory exists');

  esbuild.build({
    entryPoints: ['content.js'],
    bundle: true,
    outfile: path.join(buildDirFirefox, 'content-bundle.js'),
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ||
        'development')
    }
  }).catch(() => process.exit(1));
  console.log('content-bundle.js created for firefox');

  esbuild.build({
    entryPoints: ['background-firefox.js'],
    bundle: false,
    outfile: path.join(buildDirFirefox, 'background-bundle.js')
  }).catch(() => process.exit(1));
  console.log('background-bundle.js created for firefox');

  esbuild.build({
    entryPoints: ['customStyles.css'],
    bundle: false,
    outfile: path.join(buildDirFirefox, 'customStyles.css')
  }).catch(() => process.exit(1));
  console.log('customStyles.css copied to firefox build directory');

  ['settings.html', 'perks.html'].forEach(file => {
    const sourceFile = path.join(__dirname, file);
    copyFileSync(sourceFile, path.join(buildDirFirefox, file));
  });
  console.log('html files copied into firefox build directory');

  copyFileSync(path.join(__dirname, 'moz-manifest.json'),
    path.join(buildDirFirefox, 'manifest.json'));
  console.log('copied manifest file into firefox build directory');

  copyFolderRecursiveSync(path.join(__dirname, 'imgs'),
    path.join(buildDirFirefox, 'imgs'));
  console.log('copied images into firefox build directory');

  const sourceToastifyCss = path.join(__dirname, 'node_modules', 'toastify-js', 'src', 'toastify.css');
  copyFileSync(sourceToastifyCss, path.join(buildDirFirefox, 'toastify.css'));
  console.log('copied toastify.css into firefox build directory');

  const sourceTippyCss = path.join(__dirname, 'node_modules', 'tippy.js', 'dist', 'tippy.css');
  copyFileSync(sourceTippyCss, path.join(buildDirFirefox, 'tippy.css'));
  console.log('copied tippy.css into firefox build directory');
}
                                            
if (!buildTarget || buildTarget === chromeBrowser) {
  buildForChrome();
}

if (!buildTarget || buildTarget === firefoxBrowser) {
  buildForFirefox();
}

console.log('build completed!');   