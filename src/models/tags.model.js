const mongoose = require('mongoose');
const {Schema} = require('mongoose')

const tagsSchema = new mongoose.Schema({
    name : {type: String, required: true},
    description : {type: String},
    userId : {type: Schema.Types.ObjectId, required: true}
})

const TagsModel = mongoose.model('Tags', tagsSchema);
module.exports  = TagsModel;