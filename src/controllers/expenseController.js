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


const CreateExpenseSchema = z.object({
    item : nonEmptyTrimmed,
    amount : moneyNumber,
    tag : objectIdString,
})


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
            return zodErrorResponse;
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

}

exports.deleteExpense = async (req, res) => {

}

exports.updateExpense = async (req, res) => {

}