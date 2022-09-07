const express = require('express');
const router = express.Router();
const Camp = require('../models/camp');
const myError = require('../utils/ExpressErrors');
const asyncError = require('../utils/AsyncError.js');
const { campSchema } = require('../joiSchema');

const validateCamp = (req, res,next) =>{
    const {error} = campSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}

router.get('/', asyncError(async (req, res)=>{
    const campgrounds = await Camp.find({});
    res.render('campgrounds/index', {campgrounds});
}))

router.get('/new', (req, res)=>{
    res.render('campgrounds/new');
})
router.post('/',validateCamp, asyncError(async(req, res)=>{
    // if(!req.body.campground) throw new myError('Invalid Campground data', 400);
    const campground = new Camp(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(req.params.id).populate('review');
    console.log(campground);
    if(!campground) throw new myError('Invalid id!! Try another id.', 404);
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit',asyncError(async (req, res)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    res.render('campgrounds/edit', {campground});
}))
router.put('/:id', validateCamp, asyncError(async (req,res)=>{
    const { id } = req.params;
    const campground = await Camp.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id',asyncError(async (req,res)=>{
    const {id} = req.params;
    await Camp.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;