const express = require('express');
const { populate } = require('../models/camp');
const router = express.Router();
const Camp = require('../models/camp');
const asyncError = require('../utils/AsyncError.js');
const { isLoggedIn } = require('../utils/authMiddleware');
const { isAuthor } = require('../utils/authMiddleware');
const {validateCamp} = require('../utils/authMiddleware')

router.get('/', asyncError(async (req, res)=>{
    const campgrounds = await Camp.find({});
    res.render('campgrounds/index', {campgrounds});
}))

router.get('/new',isLoggedIn, (req, res)=>{
    res.render('campgrounds/new');
})
router.post('/',validateCamp, isLoggedIn, asyncError(async(req, res)=>{
    const campground = new Camp(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully create a new campground')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id)
    .populate({
        path: 'review',
        populate: {
            path: 'author'
        }
    })
    .populate('author');
    // console.log(campground);
    if(!campground) {
        req.flash('error', 'Sorry! Campground not found');
        return res.redirect('/campgrounds');
    }
   
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit',isLoggedIn,isAuthor, asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    if(!campground) {
        req.flash('error', 'Sorry! Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {campground});
}))
router.put('/:id', validateCamp,isLoggedIn,isAuthor, asyncError(async (req,res)=>{
    const {id} = req.params;
    const campground = await Camp.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', "Successfully edited the campground")
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, isAuthor, asyncError(async (req,res)=>{
    await Camp.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the campground")
    res.redirect('/campgrounds');
}))

module.exports = router;