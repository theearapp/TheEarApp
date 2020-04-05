const express = require('express');
const userRouter = express.Router();
const userController = require('./userController');

userRouter.all('/create', (req, res) => {
    userController.createUser(req, res);
})

userRouter.all('/login', (req, res) => {
    userController.login(req, res);
})

userRouter.all('/logout', (req, res) => {
    userController.logout(req, res);
})

module.exports = userRouter;