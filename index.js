const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Camp = require('./models/camp')
const method = require('method-override');
const ejsMate = require('ejs-mate');
const myError = require('./utils/ExpressErrors');
const asyncError = require('./utils/AsyncError.js');
const ExpressError = require('./utils/ExpressErrors');
const joi = require('joi');
const { campSchema } = require('./joiSchema');
const { reviewSchema } = require('./joiSchema');
const Review = require('./models/reviews');

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

const validateCamp = (req, res,next) =>{
    const {error} = campSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}
const validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}

app.get('/', (req,res)=>{
    res.render('home');
})

app.get('/campgrounds', asyncError(async (req, res)=>{
    const campgrounds = await Camp.find({});
    res.render('campgrounds/index', {campgrounds});
}))

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new');
})
app.post('/campgrounds',validateCamp, asyncError(async(req, res)=>{
    // if(!req.body.campground) throw new myError('Invalid Campground data', 400);
    const campground = new Camp(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(req.params.id).populate('review');
    console.log(campground);
    if(!campground) throw new myError('Invalid id!! Try another id.', 404);
    res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit',asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    res.render('campgrounds/edit', {campground});
}))
app.put('/campgrounds/:id', validateCamp, asyncError(async (req,res)=>{
    const { id } = req.params;
    const campground = await Camp.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id',asyncError(async (req,res)=>{
    const {id} = req.params;
    await Camp.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews',validateReview, asyncError(async(req,res)=>{
    const campground =  await Camp.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.review.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
app.delete('/campgrounds/:id/reviews/:reviewId', asyncError(async(req, res) =>{
    await Camp.findByIdAndUpdate(req.params.id, {$pull: {review: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${req.params.id}`);
}))

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