const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const method = require('method-override');
const ejsMate = require('ejs-mate');
const joi = require('joi');
const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")
// const { campSchema } = require('./joiSchema');
// const { reviewSchema } = require('./joiSchema');
// const Review = require('./models/reviews');
// const myError = require('./utils/ExpressErrors');
// const asyncError = require('./utils/AsyncError.js');
// const Camp = require('./models/camp')

mongoose.connect('mongodb://localhost:27017/camp-king', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended: true}));
app.use(method('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req,res)=>{
    res.render('home');
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.all('*',(req, res, next)=>{
    next(new myError('Page not found', 404))
})

app.use((err, req, res, next) =>{
    const {status = 500} = err;
    if(!err.message) err.message = 'Oh No, There was an error!!'
    res.status(status).render('error' , {err});
} )
app.listen(3000, ()=>{
    console.log("Listening to port 3000"); 
})