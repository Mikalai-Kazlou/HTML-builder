const fs = require('fs');

const path = require('path');
const sDirDestination = path.join(__dirname, 'project-dist');

const sDirComponents = path.join(__dirname, 'components');
const sPathHtmlTemplate = path.join(__dirname, 'template.html');
const sPathHtmlBundle = path.join(__dirname, 'project-dist', 'index.html');

// Create destination folder
fs.mkdir(sDirDestination, { recursive: true },
  (error) => {
    if (error) {
      console.log(error);
    }
  });

// Process of HTML file
const stream = fs.createReadStream(sPathHtmlTemplate, 'utf-8');
const output = fs.createWriteStream(sPathHtmlBundle);
let sTemplateData = '';

function replaceData(data, oReplaceTemplate, i) {
  const input = fs.createReadStream(path.join(sDirComponents, oReplaceTemplate[i].fileName), 'utf-8');
  let fileContent = '';

  input.on('data', chunk => fileContent += chunk);
  if (i < oReplaceTemplate.length - 1) {
    input.on('end', () => {
      data = data.replace(oReplaceTemplate[i].tag, fileContent);
      replaceData(data, oReplaceTemplate, i + 1);
    });
  } else {
    input.on('end', () => {
      data = data.replace(oReplaceTemplate[i].tag, fileContent);
      output.write(data);
    });
  }
}

function getReplaceTemplate(data) {
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
      fileName: fileName
    });
    oTag = findNextTag(data, oTag.index);
  }

  return result;
}

stream.on('data', chunk => sTemplateData += chunk);
stream.on('end', () => {
  const oReplaceTemplate = getReplaceTemplate(sTemplateData);
  replaceData(sTemplateData, oReplaceTemplate, 0);
});  