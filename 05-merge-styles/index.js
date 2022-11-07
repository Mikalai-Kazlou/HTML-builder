const fs = require('fs');

const path = require('path');
const sSourcePath = path.join(__dirname, 'styles');
const sDestinationPath = path.join(__dirname, 'project-dist', 'bundle.css');

function mergeFiles(content, source, destination, files, i) {
  content += '\n';
  const stream = fs.createReadStream(path.join(source, files[i].name), 'utf-8');
  stream.on('data', chunk => content += chunk);

  if (i < files.length - 1) {
    stream.on('end', () => mergeFiles(content, source, destination, files, i + 1));
  } else {
    stream.on('end', () => {
      const output = fs.createWriteStream(destination);
      output.write(content);
    });
  }
}

function mergeStyles(source, destination) {
  let content = '';

  fs.readdir(source, { withFileTypes: true },
    (error, files) => {
      if (error)
        console.log(error);
      else {
        const cssFiles = [];

        files.forEach(file => {
          const info = path.parse(file.name);
          if (file.isFile() && info.ext === '.css') {
            cssFiles.push(file);
          }
        });

        mergeFiles(content, source, destination, cssFiles, 0);
      }
    });
}

mergeStyles(sSourcePath, sDestinationPath);