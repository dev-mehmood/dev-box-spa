const mongoose = require('mongoose');
const { importmapdb: db } = require('../services/mongoose.connection');

const Schema = mongoose.Schema;
const ImportMapSchema = new Schema({
  imports: {
    type: Object
  },
  mode: {
    type: String
  }

});


db.model('importmap', ImportMapSchema);

module.exports = {
  schema: ImportMapSchema,
  model: db.model('importmap')
}
