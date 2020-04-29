const Methods = require('../../Resources/helperFunctions');
const User = require('./userSchema.js');
const mongoose = require('mongoose');
const UserTokenHandler = require('./userTokenHandler')

class UserDataHandler {
    constructor(username = '') {
        this.username = username;
        this.user = new User({ 'username': username });
    }

    createUser(userInfo, callback) {
        this.user = new User(userInfo);
    
        if (this.user.phone && this.user.phone.number) {
            this.user.phone.isVerified = false;
        }
    
        if (this.user.email && this.user.email.value) {
          this.user.email.isVerified = false;
        }
    
        // Assigning a unique id based on the automatically generated `_id`
        this.user.uid = new mongoose.mongo.ObjectID(this.user._id.id);

        const user = this.user;
        user.save((err) => {
          if (err != null && err.code == 11000) {
            let message = '';
            let errorCode = 0;
            // Handling when credential or callerId duplicates occurr
            if (err.errmsg.includes('username')) {
              errorCode = 1000;
              message = 'Username already in use, please try a different username.';
            } else if (err.errmsg.includes('phone')) {
              errorCode = 1001;
              message = 'Phone number already in use, please try a different phone number.';
            } else if (err.errmsg.includes('email')) {
              errorCode = 1002;
              message = 'Email already in use, please try a different email.';
            } else {
              errorCode = 1003;
              message = 'Collision occurred, cannot sign up at the moment. Please try again.';
            }
    
            callback(null, message, errorCode);
            return;
          } else if (err) {
            callback(null, 'An unknown Signup Error occurred', 1004);
            return;
          }
    
          const tokenHandler = new UserTokenHandler(User, user);
          tokenHandler.generateToken(user.password, function (newToken) {
            if (!newToken) {
              callback(null, 'Failed to generate token, try to login', 1005);
              return;
            }
    
            tokenHandler.insertToken(newToken, function (insertSuccess) {
              if (insertSuccess == true) {
                user.token = newToken;
                callback(user, 'Successfully Registered a New Account', 1);
              } else {
                callback(null, 'Failed to Register a New Account', 1006);
              }
            });
          });
        });
      }


      logIn(username, password, callback) {
        
        // Finds user with given username and returns User object without id or interest
        User.findOne({'username': username}, (err, user) => {
          if (err) {
            callback(null, err, 1004);
            return;
          }
    
          if (user == null) {
            callback(null, 'This user does not match any HMU accounts. Please sign up', 1102);
            return;
          }
          
          user.comparePassword(password, (err, isMatch) => {
            if (err) {
              callback(null, 'Error has occured', 1004);
              return;
            }
    
            if (!isMatch) {
              callback(null, 'Incorrect password. Please try again', 1101);
              return;
            }
    
            const tokenHandler = new UserTokenHandler(User, user);
            tokenHandler.generateToken(user.password, function (newToken) {
              if (!newToken) {
                callback(null, 'Failed to generate token, try to login again', 1005);
                return;
              }
    
              // Overwrite / assign newly generated token to deviceInfo prior to inserting to user document.
              tokenHandler.insertToken(newToken, function (insertSuccess) {
                if (insertSuccess == true) {
                  user.tokenInfo = newToken;
                  user.password = undefined;
                  callback(user, 'Successfully Logged In', 1);
                } else {
                  callback(null, 'Failed to Login', 1006);
                }
              });
            });
          });
        });
      }
      
      logoutUser(userID, token, callback) {
        if (token == null || userID == null || token == '' || userID == '') {
          callback(false, 'Missing token or userid', 1100);
          return;
        }
        console.log('test for updating');
        callback(true, 'testing', 1)
        return;
        // User.findOne({ 'uid': userID }, { 'interests': 0, '__v': 0 }, function (err, user) {
        //   if (err) {
        //     callback(false, 'Error has occured', 1004);
        //     return;
        //   }
    
        //   if (!user) {
        //     callback(false, 'Failed to logout', 1102);
        //     return;
        //   }
    
        //   const userToken = new UserTokenHandler(User, user);
        //   userToken.invalidateToken(token, function (isLogout, message, errorCode) {
        //     callback(isLogout, message, errorCode);
        //     return;
        //   });
        // });
      }
}

module.exports = UserDataHandler;