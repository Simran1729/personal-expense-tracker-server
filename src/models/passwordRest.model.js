const mongoose = require('mongoose');
const {Schema} = require('mongoose')

const passwordResetSchema = new mongoose.Schema(
        {
        user_id : {type: Schema.Types.ObjectId, ref : 'User', required : true},
        jti : {type: String, required: true, unique: true },
        }, 
        {timestamps: true}
);

passwordResetSchema.index({createdAt: 1}, {expireAfterSeconds: 900})

const PasswordResetModel = mongoose.model('PasswordReset', passwordResetSchema);
module.exports = PasswordResetModel;