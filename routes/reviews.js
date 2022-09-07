const express = require('express');
const router = express.Router({mergeParams: true});
const myError = require('../utils/ExpressErrors');
const asyncError = require('../utils/AsyncError.js');
const { reviewSchema } = require('../joiSchema');
const Review = require('../models/reviews');
const Camp = require('../models/camp');

const validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}
router.post('/',validateReview, asyncError(async(req,res)=>{
    const campground =  await Camp.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.review.push(review)
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:reviewId', asyncError(async(req, res) =>{
    await Camp.findByIdAndUpdate(req.params.id, {$pull: {review: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${req.params.id}`);
}))

module.exports = router;