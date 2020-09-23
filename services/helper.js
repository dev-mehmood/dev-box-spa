

require('dotenv').config();
const firebaseKey = require("firebase-key");
const fs = require('fs');
const path = require('path');
let { schema, model } = require('../model/importmap.model');
const { promiseImpl } = require('ejs');
const cache = require('./cache')

module.exports = {
  decodeImports: (data) => {
    const imports = {}
    let decoded = ''
    for (const [key, value] of Object.entries(data.imports)) {
      decoded = firebaseKey.decode(key)
      imports[decoded] = value;
    }
    return imports;
  },
  encodeImports: (data) => {
    const imports = {}
    let decoded = ''
    for (const [key, value] of Object.entries(data.imports)) {
      decoded = firebaseKey.encode(key)
      imports[decoded] = value;
    }
    return imports;
  },
  decodeKey: (key) => {
    return firebaseKey.decode(key)
  },
  encodeKey: (key) => {
    return firebaseKey.encode(key);
  },


  seed: async (mode = 'prod') => {
    try {

      let data = await model.find({ mode }).exec();
      if (!data.length) {
        // create three seeds
        const promiseArray = [];
        const arr = ['prod', 'stage', 'review']
        arr.forEach((mod => {
          promiseArray.push(createSeed(mod))
        }))
        await Promise.all(promiseArray)
        return true;
      } else {
        data.forEach(({ _doc }) => {
          _doc.imports = module.exports.decodeImports(_doc)
          cache.set(_doc.mode, _doc)
          console.log(cache.get(_doc.mode))
        })
        return true;
      }

    } catch (e) {
      throw Error(e);
    }

    function createSeed(mode) {
      return new Promise((_re, _rj) => {
        const imported = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'import-map.seed.json'), 'utf8'));
        const imports = {}
        let encoded = ''
        for (const [key, value] of Object.entries(imported.imports)) {
          encoded = firebaseKey.encode(key);
          imports[encoded] = value;
        }

        data = {
          mode,
          imports
        }
        const importMap = new model(data)

        importMap.save(function (err) {
          if (err) _rj(err);
          _re(true)
          // saved!
        });
      })

    }
  }
};
