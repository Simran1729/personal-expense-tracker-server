// app is where you initialize your application

const express = require('express');
const app = express();

app.use(express.json());


//error middleware for route not found
app.use((req, res) =>{
    res.status(404).json({
        message : 'Route not found'
    })
})

module.exports = app;