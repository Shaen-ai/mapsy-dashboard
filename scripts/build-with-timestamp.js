const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate unique build ID
const buildId = Date.now().toString(36);
console.log(`Building with unique ID: ${buildId}`);

// Run the build
console.log('Running build...');
execSync('GENERATE_SOURCEMAP=false react-scripts build', { stdio: 'inherit' });

// Function to rename files with timestamp
function renameFilesWithTimestamp(dir, buildId) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renameFilesWithTimestamp(filePath, buildId);
    } else if (file.endsWith('.js') || file.endsWith('.css')) {
      // Replace hash pattern with our buildId - handles both main files and chunks
      let newName = file;

      // Handle main.hash.js/css pattern
      if (file.match(/\.[a-f0-9]{8}\.(js|css)$/)) {
        newName = file.replace(/\.[a-f0-9]{8}\.(js|css)$/, `.${buildId}.$1`);
      }
      // Handle chunk files like 123.hash.chunk.js
      else if (file.match(/\.[a-f0-9]{8}\.chunk\.(js|css)$/)) {
        newName = file.replace(/\.[a-f0-9]{8}\.chunk\.(js|css)$/, `.${buildId}.chunk.$1`);
      }

      if (newName !== file) {
        const newPath = path.join(dir, newName);
        fs.renameSync(filePath, newPath);
        console.log(`Renamed: ${file} → ${newName}`);

        // Update references in HTML files and other JS files
        updateAllReferences(path.join(__dirname, '../build'), file, newName);
      }
    }
  });
}

// Function to update references in all files
function updateAllReferences(buildDir, oldName, newName) {
  // Update HTML files
  const htmlFiles = fs.readdirSync(buildDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(buildDir, f));

  htmlFiles.forEach(htmlFile => {
    let content = fs.readFileSync(htmlFile, 'utf8');
    if (content.includes(oldName)) {
      content = content.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newName);
      fs.writeFileSync(htmlFile, content);
      console.log(`Updated references in ${path.basename(htmlFile)}`);
    }
  });

  // Also update references in JS files (for dynamic imports)
  const jsDir = path.join(buildDir, 'static', 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir)
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(jsDir, f));

    jsFiles.forEach(jsFile => {
      let content = fs.readFileSync(jsFile, 'utf8');
      if (content.includes(oldName)) {
        content = content.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newName);
        fs.writeFileSync(jsFile, content);
        console.log(`Updated references in ${path.basename(jsFile)}`);
      }
    });
  }
}

// Rename files with timestamp
const buildDir = path.join(__dirname, '../build/static');
console.log('\nRenaming files with unique timestamp...');
renameFilesWithTimestamp(buildDir, buildId);

console.log('\n✅ Build complete with unique hash:', buildId);