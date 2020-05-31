
const fs = require('fs');
const path = require('path');

const findFiles = (dir, ext) => {
  let result = [];
  let scan = (direct, exten) => {
    let items = fs.readdirSync(direct, {withFileTypes: true});

    items.forEach((el) => {
      if (el.isDirectory()) {
        scan(`${direct}/${el.name}`, exten);
      } else {
        if (el.name.endsWith(exten)) {
          result.push(el.name);
        }
      }
    });
  };

  scan(dir, ext);

  return result;
};

const findEntries = (dir, ext=".js") => {
  let entry = {};

  let scripts = findFiles(dir, ext);

  scripts.forEach((script) => {
    let entryName = script.replace(/\.ts/,'');
    entry[entryName] = `${path.join(__dirname, `./src/pages/${entryName}/${entryName}`)}`;
  });
  return entry;
};

const findImagesDir = (mainDir, dir) => {
  let result = [];
  let scan = (mainDirect, direct) => {
    let folder = mainDirect;
    let items = fs.readdirSync(folder, {withFileTypes: true}).map((item) => {
      return {
        path: path.join(folder, item.name),
        file: item
      }
    });

    items.forEach((el) => {
      if (el.file.name === dir) {
        result.push(el.path);
      } else if (el.file.name !== dir && el.file.isDirectory()) {
        scan(`${mainDirect}/${el.file.name}`, direct);
      }
    });
  };

  scan(mainDir, dir);

  return result;
};


module.exports = {
  entries: findEntries,
  files: findFiles,
  imgDir: findImagesDir
};
