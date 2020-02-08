const mongoose = require('mongoose');

const mongooseClient = (callback) => {
    mongoose.connect(global.env.MONGO_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true, 
    }).then((client) => {
        console.log('Successfully Connected to the database');
    }).catch((err) => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
}

module.exports = {
    connect: mongooseClient,
}