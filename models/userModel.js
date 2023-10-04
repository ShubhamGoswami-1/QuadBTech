const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    user_email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    user_image: {
        type: String,
        default: ''
    },
    user_password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    total_orders: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    last_logged_in: {
        type: Date
    }
});

userSchema.pre('save', async function(next) {
    // Hash the password with cost of 12
    if(!this.isNew) return next();

    this.user_password = await bcrypt.hash(this.user_password, 12);
    next();
});
  
const User = mongoose.model('User', userSchema);

module.exports = User;