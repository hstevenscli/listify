const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
mongoose.connect("mongodb+srv://dbUser:AFZjRGQ5ycCoKAlt@cluster0.onxrzqp.mongodb.net/midterm?retryWrites=true&w=majority");



const contentSchema = new mongoose.Schema({
    item: String,
    link: String,
    price: Number,
    priority: Number
});

const wishlistSchema = new mongoose.Schema({
    name: String,
    content: [contentSchema],
    creator: String
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        versionKey: false,
        transform: function (doc, ret) {
            delete ret.password
        }
    }
});


// encrypt a plaintext password to store the hashed password in the db
userSchema.methods.EncryptPassword = function (plainTextPassword) {
    var promise = new Promise((resolve, reject) => {
        // resolve is then()
        // reject is catch()
        bcrypt.hash(plainTextPassword, 12).then(hash => {
            this.password = hash;
            // store hash in your password DB
            // resolve the promise, eventually...
            resolve(); // this invokes the caller's then() function
        });
    });
    return promise;
};

userSchema.methods.verifyEncryptedPassword = function (plainTextPassword) {
    // verify an attempted password compared to password in db that is encrypted
    var promise = new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, this.password).then(result => {
            resolve(result)
        })
    })
    return promise;
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

const User = mongoose.model('User', userSchema);

module.exports = {
    Wishlist: Wishlist,
    User: User
};
