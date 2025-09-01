const EXPENSE = require('../models/expense.model');
const z = require('zod');
const {isValidObjectId} = require('mongoose');

// reusable types

const objectIdString = z.string({required_error: 'Required'})
                        .refine(isValidObjectId, {message : "Invalid Mongodb ObjectId"});

const nonEmptyTrimmed = z.string({required_error : "Required"})
                         .trim()
                         .min(1, 'Required');

const moneyNumber = z.coerce
                     .number({invalid_type_error: "Amount must be a number"})
                     .positive('Amount must be > 0');


const CreateExpenseSchema = z
 .object({
        item : nonEmptyTrimmed,
        amount : moneyNumber,
        tag : objectIdString,
    })

const UpdateExpenseSchema = z
 .object({
        item : nonEmptyTrimmed.optional(),
        amount : moneyNumber.optional(),
        tag : objectIdString.optional()
    })
    .refine(
        (data) => Object.keys(data).length > 0, 
        {
            message : "At least one field is required for update",
            path : []
        }
    )


//response with parsed.success = false , looks like this : 
// {
//   success: false,
//   error: {
//     issues: [
//       { path: ['amount'], message: 'Required', code: 'invalid_type' },
//       { path: ['params', 'id'], message: 'Must be a number', code: 'invalid_type' }
//     ]
//   }
// }

function zodErrorResponse (res, parsed) {
    const errors = parsed.error.issues.map((i) => ({
        path : i.path.join('.'),
        message : i.message,
        code :  i.code
    }));
    return res.status(400).json({
        "message" : "Invalid inputs",
        errors
    })
}

exports.createExpense = async(req, res) => {
    try{
        const parsed = CreateExpenseSchema.safeParse(req.body);
        if(!parsed.success){
            return zodErrorResponse(res,parsed);
        }

        const userId = req.user.id;
        const {item, amount, tag} = req.body;

        const expense = await EXPENSE.create({item, amount, tag, user: userId});
        return res.status(201).json({
            "message" : "Expense Created Successfully",
            expense
        })
    } catch(err){
        return res.status(500).json({
            "message" : "Internal Server Error"
        })
    }
}

exports.readExpense = async (req, res) => {
    //middleware must have checked the user and attached user.id;  
    const userId = req.user.id;
    try{
        const response = await EXPENSE.find({user: userId}).populate('tag');
        return res.status(200).json({
            "message" : "Expenses fetched succesfully",
            "data" : response
        })
    } catch(err){
        return res.status(500).json({
            "message" : "Something wrong the server"
        })
    }
}

exports.deleteExpense = async (req, res) => {
    try{
        const {id} = req.params;
        const parsedId = objectIdString.safeParse(id);
        if(!parsedId.success){
            return zodErrorResponse(res, parsedId);
        }

        const userId = req.user.id;
        await EXPENSE.findOneAndDelete({user: userId, _id : id});
        return res.status(200).json({
            "message" : "Expense Deleted Successfully"
        })
    }catch(err){
        return res.status(500).json({
            "message" : "Internal Server Error"
        })
    }
}

exports.updateExpense = async (req, res) => {
    try{
        const {id} = req.params;
        const parsedId = objectIdString.safeParse(id);
        if(!parsedId.success){
            return zodErrorResponse(res, parsedId);
        }
        const parsed = UpdateExpenseSchema.safeParse(req.body);
        if(!parsed.success){
            return zodErrorResponse(res, parsed);
        }

        const userId = req.user.id;
        const allowedFields = ['item', 'tag', 'amount'];
        const updateData = {};

        allowedFields.forEach((field) => {
            if(req.body[field] !== undefined){
                updateData[field] = req.body[field]
            }
        })

        if(Object.keys(updateData).length === 0){
            return res.status(400).json({
                "message" : "No Valid fields provided for update"
            })
        }

        const updateRes= await EXPENSE.findOneAndUpdate(
            {user: userId, _id: id},
            {$set: updateData},
            {new: true, runValidators: true}
        )

        return res.status(200).json({
            "message" : "Expense Updated Successfully",
            "data" : updateRes
        })
    } catch(err){
        return res.status(500).json({
            "message" : "Internal Server Error"
        })
    }
}