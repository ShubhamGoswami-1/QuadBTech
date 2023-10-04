const authUser = require('./../models/authUsersModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError')
const util = require('util');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    });
}

// const filterObj = (obj, ...allowedFields) => {
//     const newObj = {};
//     Object.keys(obj).forEach(el => {
//         if(allowedFields.includes(el)) {
//             newObj[el] = obj[el];
//         }
//     })
//     return newObj;
// }

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // const cookieOptions = {
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     httpOnly: true
    // };

    // if(process.env.NODE_ENV === 'production'){
    //     cookieOptions.secure= true
    // }

    // res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync ( async (req, res, next) => {
    const newUser = await authUser.create(req.body);

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // const {email, password} = req.body;
    // Check if email and password is present in request body
    if(!email || !password){
        const error = new AppError('Please provide email ID & password for login IN!', 400);
        return next(error);
    }

    // Check if user exists with given mail
    const user = await authUser.findOne({email}).select('+password');

    // const isMatch = await user.comparePasswordInDb(password, user.password);

    //Cehck if the user exists & password matches
    if(!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new AppError('Incorrect email or password', 400);
        return next(error);
    }

    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'Loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}

exports.protect = catchAsync(async (req, res, next) => {
    
    //1. Read the token and check if it exists
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token){
        next(new AppError('You are not logged in! :(', 400))
    }

    //2. Validate the token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
  
    //3. If the user exists (If the user logedin and after that user get deleted from records)
    const user = await authUser.findById(decodedToken.id);

    if(!user){
        const error = new AppError('The user with the given token doesnt exists! :(', 401);
        next(error);
    }

    //4. If the user changed password after the token was issued
    // const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
    // if(isPasswordChanged){
    //     const error = new AppError('The passowrd has been changed recently. Please login again!!! :(', 401);
    //     return next(error);
    // }

    //5. Allow users to access the routes
    req.user = user;
    next();
});