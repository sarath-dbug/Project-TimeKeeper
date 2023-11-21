const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://sarathpattambi2013:j5KG1IpftZ10zwMl@cluster0.mamtkjm.mongodb.net/timekeepes?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});


const express = require("express")
const app = express()

app.use(express.static('public'));

const userRouter =require('./routes/userRouter');
app.use('/',userRouter);    

const adminRouter =require('./routes/adminRouter');
app.use('/admin',adminRouter);


app.listen(8080,()=>console.log("Server Running at http://localhost:8080'"))

