const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    item : {type : String, required: true},
    amount : {type : Number, required: true},
    //add tag id later on
})