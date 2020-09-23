
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('dotenv').config();


const map = new Map();

map.set(process.env.MONGO_db_URI,'devboxdb')
map.set(process.env.IMPORT_MAPS_DB_URI,'importmapdb');

module.exports = {
    connect: connectionFectory,
    devboxdb: null,
    importmapdb: null
}

function getDb(uri) {
    return cache.get(uri.split('/').slice(-1).pop())
}

function connectionFectory(uri) {
    
    return new Promise((resolve, reject) => {
        
        let name = uri.split('/').slice(-1).pop()
        if (module.exports[map.get(uri)]) return resolve(module.exports[map.get(uri)]);

        let conn = mongoose.createConnection(uri, { useNewUrlParser: true })

        conn.on("open", function () {

           
            module.exports[map.get(uri)]= conn;
            resolve(conn);
            console.log("Mongoose connected to " + uri);
        });

        conn.on("error", function (err) {
            reject();
            console.log("Mongoose connection error" + err);
        });

        conn.on("disconnected", function () {
            module.exports[map.get(uri)] = null;
            // cache.set(name, null)
            console.log("Mongoose disconnected");
        })
    })
}