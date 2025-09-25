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
      // Replace hash pattern with our buildId
      const newName = file.replace(/\.[a-f0-9]{8}\.(js|css)$/, `.${buildId}.$1`);
      if (newName !== file) {
        const newPath = path.join(dir, newName);
        fs.renameSync(filePath, newPath);
        console.log(`Renamed: ${file} → ${newName}`);

        // Update references in HTML files
        updateHtmlReferences(path.join(__dirname, '../build'), file, newName);
      }
    }
  });
}

// Function to update references in HTML files
function updateHtmlReferences(buildDir, oldName, newName) {
  const htmlFiles = fs.readdirSync(buildDir)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(buildDir, f));

  htmlFiles.forEach(htmlFile => {
    let content = fs.readFileSync(htmlFile, 'utf8');
    if (content.includes(oldName)) {
      content = content.replace(new RegExp(oldName, 'g'), newName);
      fs.writeFileSync(htmlFile, content);
      console.log(`Updated references in ${path.basename(htmlFile)}`);
    }
  });
}

// Rename files with timestamp
const buildDir = path.join(__dirname, '../build/static');
console.log('\nRenaming files with unique timestamp...');
renameFilesWithTimestamp(buildDir, buildId);

console.log('\n✅ Build complete with unique hash:', buildId);