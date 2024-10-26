                                                                             
 const esbuild = require('esbuild');                                          
 const fs = require('fs');                                                    
 const path = require('path');                                                
                                                                              
 // Helper function to ensure a directory exists                              
 function ensureDirSync(dir) {                                                
   if (!fs.existsSync(dir)) {                                                 
     fs.mkdirSync(dir, { recursive: true });                                  
     console.log(`${dir} directory created`);                                 
   }                                                                          
 }                                                                            
                                                                              
 // Helper function to copy a file                                            
 function copyFileSync(source, target) {                                      
   let targetFile = target;                                                   
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
                                                                              
 // Define build directories                                                  
 const buildDirChrome = path.join(__dirname, 'build-chrome');                 
 const buildDirFirefox = path.join(__dirname, 'build-firefox');
     
                                                                              
 // Ensure build directories exist                                            
 ensureDirSync(buildDirChrome);                                               
 ensureDirSync(buildDirFirefox);
 console.log('build directories setup');                                              
                                                                              
 // Build content.js for both Chrome and Firefox                              
 esbuild.build({                                                              
   entryPoints: ['content.js'],                                               
   bundle: true,                                                              
   outfile: path.join(buildDirChrome, 'content-bundle.js'),                   
   define: {                                                                  
     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ||           
 'development')                                                               
   }                                                                          
 }).catch(() => process.exit(1));                                             
                                                                              
 esbuild.build({                                                              
   entryPoints: ['content.js'],                                               
   bundle: true,                                                              
   outfile: path.join(buildDirFirefox, 'content-bundle.js'),                  
   define: {                                                                  
     'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ||           
 'development')                                                               
   }                                                                          
 }).catch(() => process.exit(1));
 console.log('created content-bundle in build directories');                                             
                                                                              
 // Build background.js for both Chrome and Firefox                           
 esbuild.build({                                                              
   entryPoints: ['background.js'],                                            
   bundle: false,                                                             
   outfile: path.join(buildDirChrome, 'background-bundle.js')                 
 }).catch(() => process.exit(1));                                             
                                                                              
 esbuild.build({                                                              
   entryPoints: ['background.js'],                                            
   bundle: false,                                                             
   outfile: path.join(buildDirFirefox, 'background-bundle.js')                
 }).catch(() => process.exit(1));
 console.log('created background-bundle in build directories');                                            
                                                                              
 
 // Copy customStyles.css
esbuild.build({
  entryPoints: ['customStyles.css'],
  bundle: false,
  outfile: path.join(buildDirChrome, 'customStyles.css')
}).catch(() => process.exit(1));

esbuild.build({
  entryPoints: ['customStyles.css'],
  bundle: false,
  outfile: path.join(buildDirFirefox, 'customStyles.css')
}).catch(() => process.exit(1));
console.log('moved customStyles.css into build directories');
                                                                              
 // Copy HTML files                                                           
 ['settings.html', 'perks.html'].forEach(file => {                            
   const sourceFile = path.join(__dirname, file);                             
   copyFileSync(sourceFile, path.join(buildDirChrome, file));                 
   copyFileSync(sourceFile, path.join(buildDirFirefox, file));                
 });
 console.log('moved settings.html, perks.html files into build directories');                                                          
                                                                              
 // Copy manifest files                                                       
 copyFileSync(path.join(__dirname, 'chrome-manifest.json'),                   
 path.join(buildDirChrome, 'manifest.json'));                                 
 copyFileSync(path.join(__dirname, 'moz-manifest.json'),                      
 path.join(buildDirFirefox, 'manifest.json'));
 console.log('copied manifest file into build directories');                             
                                                                              
 // Copy imgs folder                                                          
 copyFolderRecursiveSync(path.join(__dirname, 'imgs'),                        
 path.join(buildDirChrome, 'imgs'));                                          
 copyFolderRecursiveSync(path.join(__dirname, 'imgs'),                        
 path.join(buildDirFirefox, 'imgs'));
 console.log('copied imgs into build directories');                                    
                                                                              
 // Copy Toastify CSS file                                                    
 const sourceToastifyCss = path.join(__dirname, 'node_modules', 'toastify-js', 'src', 'toastify.css');                                                      
 copyFileSync(sourceToastifyCss, path.join(buildDirChrome, 'toastify.css'));  
 copyFileSync(sourceToastifyCss, path.join(buildDirFirefox, 'toastify.css'));
 console.log('copied toastify.css into build directories');
                                                                              
 // Copy Tippy CSS file                                                       
 const sourceTippyCss = path.join(__dirname, 'node_modules', 'tippy.js',      
 'dist', 'tippy.css');                                                        
 copyFileSync(sourceTippyCss, path.join(buildDirChrome, 'tippy.css'));        
 copyFileSync(sourceTippyCss, path.join(buildDirFirefox, 'tippy.css'));
 console.log('copied tippy.css into build directories');

 console.log('build done!');
