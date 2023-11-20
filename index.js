const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://sarathpattambi2013:1hq758CYy1jSZNmT@timekeepers.pii0r7t.mongodb.net/?retryWrites=true&w=majority');



const express = require("express")
const app = express()

app.use(express.static('public'));

const userRouter =require('./routes/userRouter');
app.use('/',userRouter);    

const adminRouter =require('./routes/adminRouter');
app.use('/admin',adminRouter);


app.listen(8080,()=>console.log("Server Running at http://localhost:8080'")) 

