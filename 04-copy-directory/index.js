const fs = require('fs');

const path = require('path');
const dirSource = path.join(__dirname, 'files');
const dirDestination = path.join(__dirname, 'files-copy');

function deleteFiles(error, files) {
  if (error)
    console.log(error);
  else {
    files.forEach(file => {
      if (file.isFile()) {
        fs.unlink(path.join(dirDestination, file.name),
          (error) => {
            if (error) {
              console.log(error);
            }
          });
      }
    });
  }
}

function copyFiles() {
  fs.readdir(dirSource, { withFileTypes: true },
    (error, files) => {
      if (error)
        console.log(error);
      else {
        files.forEach(file => {
          if (file.isFile()) {
            fs.copyFile(path.join(dirSource, file.name), path.join(dirDestination, file.name),
              (error) => {
                if (error) {
                  console.log(error);
                }
              });
          }
        })
      }
    });
}

function copyDir() {
  fs.mkdir(dirDestination, { recursive: true },
    (error) => {
      if (error) {
        console.log(error);
      }
    });

  fs.readdir(dirDestination, { withFileTypes: true },
    (error, files) => {
      deleteFiles(error, files);
      copyFiles();
    });
}

copyDir();