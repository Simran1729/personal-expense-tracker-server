const mongoose = require('mongoose');
const {Schema} = require('mongoose')

const tagsSchema = new mongoose.Schema({
    name : {
        type: String, 
        required: true,
        lowercase: true, 
        trim: true
    },
    description : {type: String},
    userId : {type: Schema.Types.ObjectId, required: true}
})

const TagsModel = mongoose.model('Tag', tagsSchema);
module.exports  = TagsModel;