let fs = require("fs");
let dir = require("node-dir");
const path = require("path");

let readFile = function(fileName) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, "utf-8", function(err, contents) {
      if (err) {
        reject(err);
      } else {
        resolve(contents);
      }
    });
  });
};

let writeOutput = data => {
  let outputPath = path.join(
    __dirname,
    "../../../../../",
    "ab-core/controls/ab-essential-strings.js"
  );

  return new Promise(function(resolve, reject) {
    fs.writeFile(outputPath, data, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

let getTokens = fileContents => {
  let tokens = [];
  let s = fileContents.split("_L(");

  let i = 1;

  for (i; i < s.length; i++) {
    let token = s[i];

    // Tagged strings must be enclosed in single quotes for this script to pick them up.
    // This will be the case if the prettier script is run on the files.

    // TODO: Should this be made to work if the strings are enclosed with double quotes.
    let start = token.indexOf("'");
    let end = token.indexOf("'", start + 1);


    tokens.push(token.substring(start + 1, end));
  }

  return tokens;
};

let createLookup = token => {
  let key =
    "z_" +
    token
      .replace(/\s/g, "_")
      .replace(/[!?\.]/g, "")
      .toUpperCase()
      .trim();

  let delimiter = ":";

  // Check if the last character of the token is :
  if (token.lastIndexOf(":") === token.length - 1) {
    key = key.slice(0, -1);
  }

  return {
    key,
    token,
    delimiter
  };
};

let generateFile = translatableObjects => {
  let data = "Ab.view.EssentialStrings = Ab.view.Component.extend(\n";

  data += "{\n";
  data += "   // @begin_translatable\n";

  translatableObjects.forEach(o => {
    data += "   " + o.key + o.delimiter + "'" + o.token + "',\n";
  });

  // Remove the trailing comma
  data = data.substring(0, data.length - 2);

  data += "\n   // @end_translatable\n";
  data += "});\n";

  return data;
};

let srcPath = path.join(__dirname, "../", "src");
dir
  .promiseFiles(srcPath)
  .then(function(files) {
    let jsFiles = files.filter(file => path.extname(file) === ".js");

    return Promise.all(jsFiles.map(readFile));
  })
  .then(fileContents => {
    let uniqueTokens = fileContents.reduce((acc, curVal) => {
      let tokens = getTokens(curVal);
      tokens.forEach(token => {
        if (token) {
          acc.add(token);
        }
      });
      return acc;
    }, new Set());

    let translatableObjects = Array.from(uniqueTokens).map(token =>
      createLookup(token)
    );

    // Check if any of the keys are duplicated
    let keySet = new Set();
    let index = 0;
    translatableObjects.forEach((o, idx) => {
      if (keySet.has(o.key)) {
        // duplicate... modify the key
        translatableObjects[idx].key =
          translatableObjects[idx].key + "_" + index;
        index += 1;
        keySet.add(translatableObjects[idx].key);
      } else {
        keySet.add(o.key);
      }
    });

    translatableObjects.sort((a, b) => a.token.localeCompare(b.token));

    let fileData = generateFile(translatableObjects);

    return writeOutput(fileData);
  })
  .then(() => console.log("Finished..."))
  .catch(function(e) {
    console.error(e);
  });
