const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const folderSchema = new Schema({
    
    name: {
      type: String,
      required: true
    },

    userId: {
        type: String,
        required: true
    },

    parent: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Folder', folderSchema);