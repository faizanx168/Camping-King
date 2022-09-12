const mongoose = require('mongoose');
const Camp = require('../models/camp');
const cities = require('./cities');
const { places, descriptors } = require('./seedsHelper');

mongoose.connect('mongodb://localhost:27017/camp-king', {useNewUrlparser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('database Connected Successfully');
})

const sample = array => array[Math.floor(Math.random()* array.length)];


const seedDB = async() =>{
    await Camp.deleteMany({});
    
for(let i = 0; i <50 ; i++){
    const randomNum = Math.floor(Math.random()*1000);
    const price = Math.floor(Math.random()*20) +10;
    const camp = new Camp({
        author: '631aa35829fb338ddaab3e0f',
        title: `${sample(descriptors)} ${sample(places)}`,
        location: `${cities[randomNum].city} , ${cities[randomNum].state}`,
        image:[{
         url: 'https://source.unsplash.com/collection/483251',
         filename: 'seeds/splashimage'
        }],
        description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque molestiae tempore eligendi itaque vel accusamus fugiat ad aspernatur doloribus nesciunt, facilis, nisi obcaecati sit optio sapiente animi reiciendis quaerat. Illo.',
        price: price
    })
    await camp.save();
}
}

seedDB().then(() =>{
    mongoose.connection.close();
})