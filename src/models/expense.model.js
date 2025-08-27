const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const expenseSchema = new mongoose.Schema({
    item : {type : String, required: true},
    amount : {type : Number, required: true},
    tag : {type: Schema.Types.ObjectId, ref: 'Tag'},
    user : {type: Schema.Types.ObjectId, ref: 'User'}
}, {strict: true, timestamps: true})

const expenseModel = mongoose.model('Expense', expenseSchema);
module.exports = expenseModel;