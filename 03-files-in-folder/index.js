const fs = require('fs');

const path = require('path');
const dirPath = path.join(__dirname, 'secret-folder');

function showFileInfo(file) {
  fs.stat(path.join(dirPath, file.name),
    (error, stats) => {
      if (error)
        console.log(error);
      else {
        const info = path.parse(file.name);
        console.log(`${info.name} - ${info.ext.slice(1)} - ${stats.size} byte`);
      }
    });
}

fs.readdir(dirPath, { withFileTypes: true },
  (error, files) => {
    if (error)
      console.log(error);
    else {
      files.forEach(file => {
        if (file.isFile()) {
          showFileInfo(file);
        }
      })
    }
  })