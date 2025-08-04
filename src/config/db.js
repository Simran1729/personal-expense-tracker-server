const mongoose = require('mongoose');


const connectDb = async () => {
    const DB_URL = process.env.DB_URL;
    if(!DB_URL){
        throw new Error('No db_url found');
    }else{
        //this is async function, so awati
        await mongoose.connect(DB_URL);
        console.log("connected to db!")
    }
};

module.exports = connectDb;