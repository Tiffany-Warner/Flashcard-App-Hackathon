const mongoose = require('mongoose');

// import schema
const Schema = mongoose.Schema;

// create schema for flash cards
const CardSchema = new Schema({
   word: {
       type: String,
       required: true
   },
   description: {
       type: String,
       required: true
   }
});

// create 'cards' model and connect it to CardSchema
mongoose.model('cards', CardSchema);