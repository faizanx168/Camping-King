const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Camp = require('./models/camp')
const method = require('method-override');

mongoose.connect('mongodb://localhost:27017/camp-king', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.urlencoded({extended: true}));
app.use(method('_method'));

app.get('/', (req,res)=>{
    res.render('home');
})

app.get('/campgrounds', async (req, res)=>{
    const campgrounds = await Camp.find({});
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', (req, res)=>{
    res.render('campgrounds/new');
})
app.post('/campgrounds', async(req, res)=>{
    const campground = new Camp(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id', async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    res.render('campgrounds/show', {campground});
})

app.get('/campgrounds/:id/edit', async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    res.render('campgrounds/edit', {campground});
})
app.put('/campgrounds/:id', async (req,res)=>{
    const { id } = req.params;
    const campground = await Camp.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
})
app.delete('/campgrounds/:id', async (req,res)=>{
    const {id} = req.params;
    await Camp.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=>{
    console.log("Listening to port 3000"); 
})