const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.getUser = catchAsync( async(req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if(!user) {
        return next(new AppError(`User with this id:${userId} do not exists! :(`));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
})

exports.userUpdate = catchAsync(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new AppError('No user wxists with this id', 404));
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    });
});

exports.getUserImage = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new AppError('No user wxists with this id', 404));
    }

    res.status(200).json({
        status: 'sucess',
        data: {
            user_image: user.user_image
        }
    });
});

exports.createUser = catchAsync(async (req, res, next) => {

    const user = await User.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            user
        }
    });
});

exports.deleteUser = catchAsync( async (req, res, next) => {
    const userId = req.params.id

    const user = await User.findByIdAndDelete(userId);

    if(!user) {
        return next(new AppError(`User with this id:${userId} do not exists! :(`));
    }

    res.status(204).json({
        status: 'success',
        data: null
    })
})