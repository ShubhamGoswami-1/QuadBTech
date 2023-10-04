const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          // This only works on CREATE and SAVE!!!
          validator: function(el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
        }
    },
});

userSchema.methods.comparePasswordInDb = async function(paswd, pswdDb){
    return await bcrypt.compare(paswd, pswdDb);
}

userSchema.pre('save', async function(next) {
    // Hash the password with cost of 12
    if(!this.isNew) return next();

    this.passwordConfirm = undefined;
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
  
const authUser = mongoose.model('authUser', userSchema);

module.exports = authUser;