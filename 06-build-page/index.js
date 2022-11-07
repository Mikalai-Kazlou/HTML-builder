const fs = require('fs');

const path = require('path');
const sDirDestination = path.join(__dirname, 'project-dist');

const sDirComponents = path.join(__dirname, 'components');
const sPathHtmlTemplate = path.join(__dirname, 'template.html');
const sPathHtmlBundle = path.join(sDirDestination, 'index.html');

const sPathCssSource = path.join(__dirname, 'styles');
const sPathCssDestination = path.join(sDirDestination, 'style.css');

const sPathAssetsSource = path.join(__dirname, 'assets');
const sPathAssetsDestination = path.join(sDirDestination, 'assets');

// Create destination folder
fs.mkdir(sDirDestination, { recursive: true },
  (error) => {
    if (error) {
      console.log(error);
    }
  });

// Process of HTML file
function replaceData(data, oReplaceTemplate, i, bundle) {
  const input = fs.createReadStream(oReplaceTemplate[i].filePath, 'utf-8');
  let fileContent = '';

  input.on('data', chunk => fileContent += chunk);
  if (i < oReplaceTemplate.length - 1) {
    input.on('end', () => {
      data = data.replace(oReplaceTemplate[i].tag, fileContent);
      replaceData(data, oReplaceTemplate, i + 1, bundle);
    });
  } else {
    input.on('end', () => {
      data = data.replace(oReplaceTemplate[i].tag, fileContent);
      const output = fs.createWriteStream(bundle);
      output.write(data);
    });
  }
}

function getReplaceTemplate(data, components) {
  const result = [];

  function findNextTag(data, index) {
    const sIndex = data.indexOf('{{', index + 2);
    const eIndex = data.indexOf('}}', index + 2);
    return {
      tag: data.slice(sIndex, eIndex + 2),
      index: eIndex
    };
  }

  oTag = findNextTag(data, 0);
  while (oTag.tag) {
    const fileName = oTag.tag.slice(2, -2) + '.html';
    result.push({
      tag: oTag.tag,
      filePath: path.join(components, fileName)
    });
    oTag = findNextTag(data, oTag.index);
  }

  return result;
}

function mergeHtml(template, components, bundle) {
  let sTemplateData = '';
  const stream = fs.createReadStream(template, 'utf-8');

  stream.on('data', chunk => sTemplateData += chunk);
  stream.on('end', () => {
    const oReplaceTemplate = getReplaceTemplate(sTemplateData, components);
    if (oReplaceTemplate.length > 0) {
      replaceData(sTemplateData, oReplaceTemplate, 0, bundle);
    }
  });
}

mergeHtml(sPathHtmlTemplate, sDirComponents, sPathHtmlBundle);

// Process of CSS file
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

mergeStyles(sPathCssSource, sPathCssDestination);

// Copy assets
function deleteDirectory(dir) {
  fs.readdir(dir,
    (error, files) => {
      if (!error) {
        if (files.length === 0) {
          fs.rmdir(dir,
            (error) => {
              if (error) {
                console.log(error);
              }
            });
        } else {
          deleteDirectory(dir);
        }
      }
    });
}

function deleteFiles(dir) {
  fs.readdir(dir, { withFileTypes: true },
    (error, files) => {
      if (!error) {
        files.forEach(file => {
          if (file.isFile()) {
            fs.unlink(path.join(dir, file.name),
              (error) => {
                if (error) {
                  console.log(error);
                }
              });
          }
          if (file.isDirectory()) {
            deleteFiles(path.join(dir, file.name));
            deleteDirectory(path.join(dir, file.name));
          }
        });
      }
    });
}

function copyFiles(source, destination) {
  fs.readdir(source, { withFileTypes: true },
    (error, files) => {
      if (error) {
        console.log(error);
      }
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
          if (file.isDirectory()) {
            fs.mkdir(path.join(destination, file.name), { recursive: true },
              (error) => {
                if (error) {
                  console.log(error);
                }
              });

            startCopyFiles(path.join(source, file.name), path.join(destination, file.name));
          }
        })
      }
    });
}

function startCopyFiles(source, destination) {
  fs.stat(destination, (error) => {
    if (error) {
      startCopyFiles(source, destination);
    } else {
      fs.readdir(destination,
        (error, files) => {
          if (error) {
            startCopyFiles(source, destination);
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
  });
}

function copyDir(source, destination) {
  fs.mkdir(destination, { recursive: true },
    (error) => {
      if (error) {
        console.log(error);
      }
    });

  deleteFiles(destination);
  startCopyFiles(source, destination);
}

copyDir(sPathAssetsSource, sPathAssetsDestination);