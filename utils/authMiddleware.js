const Camp = require('../models/camp');
const { campSchema } = require('../joiSchema');
const myError = require('../utils/ExpressErrors');
const { reviewSchema } = require('../joiSchema');
const Review = require('../models/reviews');


module.exports.isLoggedIn = (req,res, next)=>{
    const {id , reviewId} = req.params;
    console.log(req.params)
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        console.log(req.originalUrl)
        if([`/campgrounds/${id}/reviews/${reviewId}?_method=delete`, `/campgrounds/${id}/reviews`].includes(req.originalUrl)){
            console.log('from', req.session.returnTo)
            req.session.returnTo = `/campgrounds/${id}`;
        }
        req.flash('error', 'You must be signed  in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async(req, res, next)=>{
    const {id} = req.params;
    const campground = await Camp.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'Permission required to update/delete!');
        return res.redirect('/campgrounds');
    }
    next();
}
module.exports.isReviewAuthor = async(req, res, next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'Permission required to update/delete!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.validateCamp = (req, res,next) =>{
    const {error} = campSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}

module.exports.validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const message = error.details.map(el => el.message).join(',');
        throw new myError(message, 400);
    }else{
        next();
    }
}