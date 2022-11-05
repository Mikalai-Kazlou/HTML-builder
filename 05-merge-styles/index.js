const fs = require('fs');

const path = require('path');
const sSourcePath = path.join(__dirname, 'styles');
const sDestinationPath = path.join(__dirname, 'project-dist', 'bundle.css');

function writeFile(content, source, destination, files, i) {
  const info = path.parse(files[i].name);

  if (files[i].isFile() && info.ext === '.css') {
    content += '\n';

    const stream = fs.createReadStream(path.join(source, files[i].name), 'utf-8');
    stream.on('data', chunk => content += chunk);

    if (i < files.length - 2) { //TODO: files.length - 2 is not correct
      stream.on('end', () => writeFile(content, source, destination, files, i + 1));
    } else {
      stream.on('end', () => {
        const output = fs.createWriteStream(destination);
        output.write(content);
      });
    }
  } else {
    writeFile(content, source, destination, files, i + 1);
  }
}

function mergeStyles(source, destination) {
  let content = '';

  fs.readdir(source, { withFileTypes: true },
    (error, files) => {
      if (error)
        console.log(error);
      else {
        writeFile(content, source, destination, files, 0);
      }
    });
}

mergeStyles(sSourcePath, sDestinationPath);