const fs = require('fs');
const path = require('path');

// Function to recursively search for files with (1) in their name
function findDuplicateFiles(dir) {
  const results = [];

  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      results.push(...findDuplicateFiles(filePath));
    } else if (file.includes('(1)')) {
      // Found a duplicate file
      results.push(filePath);
    }
  });

  return results;
}

// Function to delete files
function deleteFiles(files) {
  files.forEach(file => {
    try {
      fs.unlinkSync(file);
      console.log(`Deleted: ${file}`);
    } catch (err) {
      console.error(`Error deleting ${file}:`, err);
    }
  });
}

// Start the search from the current directory
const duplicateFiles = findDuplicateFiles('./src');
console.log(`Found ${duplicateFiles.length} duplicate files`);

// Delete the duplicate files
deleteFiles(duplicateFiles);
console.log('Clean-up complete!');
