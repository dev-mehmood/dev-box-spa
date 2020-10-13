
/**
 * Creating the Routes
    Now that we have middleware for handling registration and login, let’s create routes that’ll use this middleware.
 */
const express = require('express');
const fs = require('fs')
const passport = require('passport');
const cors = require('cors')
const { encodeKey, decodeKey, decodeImports, encodeImports } = require('../services/helper')
const { model: ImportMapModel } = require('../model/importmap.model')

const { response } = require('express');
const router = express.Router();


function deleteTempFile(path) {
    try {
        fs.unlinkSync(path)
        //file removed
    } catch (err) {
        console.error(err)
    }
}

router.get('/import-map.json', async (req, res, next) => {
    // const cache = require('../services/cache')
    const cache = require('../services/cache');
    let query = req.query || {};
    if (!query.mode || !cache.get([query.mode])) return res.status(401).json({success:false, message: 'Query param mode does not exists or mode value mismatches.'})
    
    fs.writeFileSync('./import-map.json', JSON.stringify({ imports: cache.get([query.mode]).imports }), 'utf8')
    const readStream = fs.createReadStream('./import-map.json');
    readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        deleteTempFile('./import-map.json');
        readStream.pipe(res);
    })
    readStream.on('error', function (err) {
        deleteTempFile('./import-map.json');
        res.end(err);
    });
});

router.patch('/import-map.json', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    // const cache = require('../services/cache');
    const cache = require('../services/cache');
    let body = req.body || {};
    if (!body) return res.status(400).send({ success: false, message: 'No data found' });
    if (!body.imports) return res.status(400).send({ success: false, message: 'data.imports is undefined' });

    body.mode = body.mode || 'prod';

    const imports = {}
    for (const [key, value] of Object.entries(body.imports)) {
        imports[encodeKey(key)] = value;
    }

    let data = {
        mode: body.mode,
        imports
    }

    if (body.delete || body.deleteAll) {
        // delete all imports or some records
        data = cache.get(body.mode);
        if (body.deleteAll) {

            await ImportMapModel.findOneAndRemove({ mode: body.mode });

        } else {

            for (const [key, value] of Object.entries(data.imports)) {
                if (key in body.imports) {
                    delete data.imports[key];
                }
            }

            data.imports = encodeImports(data);
            update(body, data)
            // ImportMapModel.update({ mode: body.mode }, data, (err, raw) => {
            //     cache.set(data.mode, { mode: data.mode, imports: decodeImports(data) });
            //     res.status(200).json({ success: true })
            // })
        }

    } else if (!cache.get(body.mode)) {
        // if data is new and is not present in the cache
        const data_ = await ImportMapModel.find({ mode: body.mode }).exec();

        if (!data_) {

            save(body, data);

        } else {

            data.imports = { ...data_.doc.imports, ...data.imports };
            update(body, data)
            // ImportMapModel.update({ mode: body.mode }, data, (err, raw) => {
            //     cache.set(data.mode, { mode: data.mode, imports: decodeImports(data) });
            //     res.status(200).json({ success: true })
            // })
        }

    } else {

        data.imports = { ...encodeImports(cache.get(body.mode)), ...data.imports };
        update(body, data)
        // ImportMapModel.update({ mode: body.mode }, data, (err, raw) => {
        //     cache.set(data.mode, { mode: data.mode, imports: decodeImports(data) });
        //     res.status(200).json({ success: true })
        // })
    }
    function save(body, data) {
        const cache = require('../services/cache');
        const importMap = new ImportMapModel(data)
        importMap.save(function (err) {
            if (err) return handleError(err);
            cache.set(data.mode, { mode: data.mode, imports: body.imports });
            res.status(200).json({ success: true })
        });
    }
    function update(body, data) {
        const cache = require('../services/cache');
        ImportMapModel.update({ mode: body.mode }, data, (err, raw) => {
            cache.set(data.mode, { mode: data.mode, imports: decodeImports(data) });
            res.status(200).json({ success: true })
        })
    }
});

module.exports = router;