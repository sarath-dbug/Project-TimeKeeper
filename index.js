const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/wristShine_E-commerce');

const express = require("express")
const app = express()

app.use(express.static('public'));

const userRouter =require('./routes/userRouter');
app.use('/',userRouter);    

const adminRouter =require('./routes/adminRouter');
app.use('/admin',adminRouter);


app.listen(8080,()=>console.log("Server Running at http://localhost:8080'"))

