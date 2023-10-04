const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/details/:id').get(userController.getUser);
router.route('/update/:id').patch(authController.protect, userController.userUpdate);
router.route('/image/:id').get(userController.getUserImage);
router.route('/insert').post(authController.protect, userController.createUser);
router.route('/delete/:id').delete(userController.deleteUser);

module.exports = router;