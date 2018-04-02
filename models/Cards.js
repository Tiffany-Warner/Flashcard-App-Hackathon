const mongoose = require('mongoose');

// create schema for flash cards
const CardSchema = mongoose.Schema({
   word: {
       type: String,
       required: true
   },
   description: {
       type: String,
       required: true
   },
   image: String
});

//Allows access of model from outside file
const Card = module.exports = mongoose.model('Card', CardSchema);