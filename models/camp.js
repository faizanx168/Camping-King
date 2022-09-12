const mongoose = require('mongoose');
const Review = require('./reviews')
const Schema = mongoose.Schema;
const { cloudinary } = require('../utils/cloudinary-config');

const Campground = new Schema({
    title: String,
    image: [
        {
            url: String,
            filename:String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
        });
    }
    if (doc.image) {
        for (let img of doc.image) {
          await cloudinary.uploader.destroy(img.filename);
        }
      }
})

module.exports = mongoose.model('Campground', Campground);

