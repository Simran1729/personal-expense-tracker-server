// app is where you initialize your application

const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes')
const tagRoutes = require('./routes/tagRoutes')
const expenseRoutes = require('./routes/expenseRoutes');

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173",
    credentials : true
}));


app.use('/api/auth', authRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/expenses', expenseRoutes )


//error middleware for route not found
app.use((req, res) =>{
    res.status(404).json({
        message : 'Route not found'
    })
});

app.use((err, req, res, next)=> {
    console.error(err.stack);
    res.status(500).json({
        "message" : "Something wrong with server"
    })
})


module.exports = app;