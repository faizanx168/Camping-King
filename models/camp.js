const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;

const Campground = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    review: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

Campground.post('findOneAndDelete', async function(doc){    
    if(doc){
        await Review.remove({
            _id:{
                $in: doc.review
            }
        })
    }
})

module.exports = mongoose.model('Campground', Campground);

