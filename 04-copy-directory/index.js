const fs = require('fs');

const path = require('path');
const sDirSource = path.join(__dirname, 'files');
const sDirDestination = path.join(__dirname, 'files-copy');

function deleteFiles(destination, error, files) {
  if (error)
    console.log(error);
  else {
    files.forEach(file => {
      if (file.isFile()) {
        fs.unlink(path.join(destination, file.name),
          (error) => {
            if (error) {
              console.log(error);
            }
          });
      }
    });
  }
}

function copyFiles(source, destination) {
  fs.readdir(source, { withFileTypes: true },
    (error, files) => {
      if (error)
        console.log(error);
      else {
        files.forEach(file => {
          if (file.isFile()) {
            fs.copyFile(path.join(source, file.name), path.join(destination, file.name),
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

function startCopyFiles(source, destination) {
  fs.readdir(destination,
    (error, files) => {
      if (error) {
        console.log(error);
      }
      else {
        if (files.length === 0) {
          copyFiles(source, destination);
        } else {
          startCopyFiles(source, destination);
        }
      }
    });
}

function copyDir(source, destination) {
  fs.mkdir(destination, { recursive: true },
    (error) => {
      if (error) {
        console.log(error);
      }
    });

  fs.readdir(destination, { withFileTypes: true },
    (error, files) => {
      deleteFiles(destination, error, files);
      startCopyFiles(source, destination);
    });
}

copyDir(sDirSource, sDirDestination);