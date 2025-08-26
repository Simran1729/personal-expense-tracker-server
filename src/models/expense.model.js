const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const expenseSchema = new mongoose.Schema({
    item : {type : String, required: true},
    amount : {type : Number, required: true},
    tag : {type: Schema.Types.ObjectId, ref: 'Tags'}
}, {strict: true, timestamps: true})

const expenseModel = mongoose.model('Expense', expenseSchema);
module.exports = expenseModel;