// app is where you initialize your application

const express = require('express');
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes')

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: "http://localhost:5173",
    credentials : true
}));


app.use('/api/auth', authRoutes);

//error middleware for route not found
app.use((req, res) =>{
    res.status(404).json({
        message : 'Route not found'
    })
});


module.exports = app;