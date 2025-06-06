const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '../node_modules/face-api.js/weights');
const targetDir = path.join(__dirname, '../public/models');

async function copyModels() {
  try {
    // Create the target directory if it doesn't exist
    await fs.ensureDir(targetDir);
    
    // Copy all files from source to target
    await fs.copy(sourceDir, targetDir);
    
    console.log('Successfully copied face-api.js model files to public/models');
  } catch (error) {
    console.error('Error copying model files:', error);
    process.exit(1);
  }
}

copyModels(); 