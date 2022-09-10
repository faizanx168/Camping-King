const express = require('express');
const router = express.Router({mergeParams: true});
const Review = require('../models/reviews');
const Camp = require('../models/camp');
const { isLoggedIn, isReviewAuthor } = require('../utils/authMiddleware');
const {validateReview} = require('../utils/authMiddleware');
const asyncError = require('../utils/AsyncError.js');


router.post('/',validateReview,isLoggedIn, asyncError(async(req,res)=>{
    const campground =  await Camp.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.review.push(review)
    await review.save();
    await campground.save();
    req.flash('success', "Successfully added the review")
    res.redirect(`/campgrounds/${campground._id}`);
}))
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, asyncError(async(req, res) =>{
    await Camp.findByIdAndUpdate(req.params.id, {$pull: {review: req.params.reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', "Successfully deleted the review")
    res.redirect(`/campgrounds/${req.params.id}`);
}))

module.exports = router;