const TAG = require('../models/tags.model');
const EXPENSE = require('../models/expense.model')
const mongoose = require('mongoose');

exports.createTag = async(req, res) => {
    try{
        const user = req.user;
        const {name, description} = req.body;
        if(!user || !user.id || !name){
            return res.status(400).json({
                "message" : "Either user id or name is missing"
            })
        }

        const existingTag  = await TAG.findOne({name, userId: user.id});
        if(existingTag){
            return res.status(400).json({
                "message" : "Tag already exists"
            })
        }

        const newTag = await TAG.create({name, description, userId : user.id});
        return res.status(201).json({
            "message" : "Tag created successfully", 
            "data" : newTag
        })
    }catch(err){
        return res.status(500).json({
            "message": "Error in creating Tag, Please try again"
        })
    }
}

exports.updateTag = async(req, res) => {
    try{
        const user = req.user;
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid tag id" });
        }


        if(!user || !user.id){
            return res.status(400).json({
                "message" : "User or user id is missing. Please log in again"
            })
        }

        const allowedFields = ["name", "description"];
        const updates = {}

        allowedFields.forEach((field) =>{
            if(req.body[field] != undefined ){
                updates[field] = req.body[field]
            }
        });


        if(Object.keys(updates).length === 0){
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        const updatedTag = await TAG.findOneAndUpdate(
            {_id : id, userId : user.id},
            { $set : updates},
            {new : true, runValidators: true}
        )
        
        if(!updatedTag){
            return res.status(404).json({
                "message" : "Tag not found"
            })
        }

        return res.json({
            "message" : "Tag updated successfull", 
            "data"  :  updatedTag
        })
    } catch(err){
        return res.status(500).json({
            "message" : "Error updating Tag"
        })
    }
}

exports.readTags = async(req, res) => {
    try{
        const user = req.user;
        if(!user || !user.id){
            return res.status(400).json({
                "message" : "User id is missing, Please login in again"
            })
        }
        const tags = await TAG.find({userId : user.id});
        return res.status(200).json({
            "message" : "Tags fetched successfully",
            "data" : tags
        })

    } catch(err){
        console.error("Error fetching Tags : ", err)
        return res.status(500).json({
            "message" : "Error reading Tags"
        })
    }
}

exports.deleteTag = async(req, res) => {
    try{
        const user = req.user;
         if(!user || !user.id){
            return res.status(400).json({
                "message" : "User id is missing, Please login in again"
            })
        }

        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid tag id" });
        }

        const expenseCount = await EXPENSE.countDocuments({ tag: id });
        if (expenseCount > 0) {
        return res.status(400).json({
            "message": "Cannot delete tag. Some expenses are still using it."
        });
        }
        
        const deletedTag = await TAG.findOneAndDelete(
            {_id: id, userId: user.id}
        )
        
        if(!deletedTag){
            return res.status(404).json({
                "message" : "No valid tag found to delete"
            })
        }
        
        return res.status(200).json({
            "message" : "Tag deletion successfull"
        })

    } catch(err){
        return res.status(500).json({
            "message" : "Error deleting Tag"
        })
    }
}