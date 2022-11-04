const fs = require('fs');

const path = require('path');
const sourcePath = path.join(__dirname, 'styles');
const destinationPath = path.join(__dirname, 'project-dist', 'bundle.css');

let content = '';
const output = fs.createWriteStream(destinationPath);

function writeFile(files, i) {
  const info = path.parse(files[i].name);

  if (files[i].isFile() && info.ext === '.css') {
    content += '\n';

    const stream = fs.createReadStream(path.join(sourcePath, files[i].name), 'utf-8');
    stream.on('data', chunk => content += chunk);

    if (i < files.length - 2) {
      stream.on('end', () => writeFile(files, i + 1));
    } else {
      stream.on('end', () => output.write(content));
    }
  } else {
    writeFile(files, i + 1);
  }
}

fs.readdir(sourcePath, { withFileTypes: true },
  (error, files) => {
    if (error)
      console.log(error);
    else {
      writeFile(files, 0);
    }
  });