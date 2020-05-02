const Methods = require('../../Resources/helperFunctions');
const User = require('./userSchema.js');
const mongoose = require('mongoose');
const UserTokenHandler = require('./userTokenHandler')
const twilio = require('twilio');
class UserDataHandler {
    constructor(username = '') {
        this.username = username;
        this.user = new User({ 'username': username });
    }

    createUser(userInfo, callback) {
        this.user = new User(userInfo);
    
        if (this.user.phone && this.user.phone.number && !isNaN(this.user.phone.number)) {
          console.log('good');
          const accountSid = 'AC6249739250f7f54d79263145d68f8e45'; // Your Account SID from www.twilio.com/console
          const authToken = '3162180bcdaf53e6b8d6c66dcdfad45b';   // Your Auth Token from www.twilio.com/console
          
          var twilio = require('twilio');
          var client = new twilio(accountSid, authToken);
          let code = Math.floor(1000 + Math.random() * 9000);
          client.messages.create({
              body: 'Your Ear verification code is: ' + code,
              to: this.user.phone.number,  // Text this number
              from: '+18188623509' // From a valid Twilio number
          }).then((message) => console.log(message)).catch((e) => console.log(e));
          // console.log(returned_message);
            this.user.phone.isVerified = false;
            this.user.phone.vcode = code;
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
            callback(null, 'This user does not match any accounts. Please sign up', 1102);
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
        User.findOne({ 'uid': userID }, { 'interests': 0, '__v': 0 }, function (err, user) {
          if (err) {
            callback(false, 'Error has occured', 1004);
            return;
          }
    
          if (!user) {
            callback(false, 'Failed to logout', 1102);
            return;
          }
    
          const userToken = new UserTokenHandler(User, user);
          userToken.invalidateToken(token, function (isLogout, message, errorCode) {
            callback(isLogout, message, errorCode);
            return;
          });
        });
      }

      verifyPhoneCode(uid, token, code, callback) {
        const userToken = new UserTokenHandler(User);
        userToken.validateToken(uid, token, function (user, message) {
          if (!user) {
            callback(false, message, 1007);
            return;
          }
    
          if (user.phone.isVerified) {
            callback(false, 'You have already verified your phone number.', 1105);
            return;
          }
          if (!user.phone.vcode || user.phone.vcode != code) {
            callback(false, 'Invalid verification code.', 1101);
            return;
          }
          // Updates user phone verification status + sets vcode to undefined bc it's no longer needed.
          user.phone.vcode = undefined;
          user.phone.isVerified = true;

          user.save((saveError) => {
            if (saveError) { 
              callback(false, saveError, 1104);
              return;
            }
    
            callback(true, 'Phone number has been verified.');
            return;
          });
        });
      }

      editUser(editedInfo, userID, token, callback) {
        const self = this;
        const userToken = new UserTokenHandler(User);
        userToken.validateToken(userID, token, function (user, err) {
          if (user) {
            Object.keys(editedInfo).forEach(function (infoKey) {
              if (infoKey == 'password' || infoKey == 'uid' || infoKey == 'tokenInfo' || !editedInfo[infoKey]) {
                return;
              }
              user[infoKey] = editedInfo[infoKey];
            });
            user.save(function (err) {
              if (err) {
                callback(false, null, message, errorCode);
                return;
              }
              callback(isEdited, user.toJSON(), 'Edited Successfully');
              return;
            });
          } else {
            callback(false, null, err, 1007);
            return;
          }
        });
      }

      changePassword(userID, oldPassword, newPassword, token, callback) {
        if (userID == null || oldPassword == null || newPassword == null || token == null ||
          userID == '' || oldPassword == '' || newPassword == '' || token == '') {
          callback(null, 'Missing values', 1100);
          return;
        }
    
        const userToken = new UserTokenHandler(User);
        userToken.validateToken(userID, token, function (user, err) {
          if (!user) {
            callback(null, err, 1004);
            return;
          }
    
          userToken.user = user;
          user.comparePassword(oldPassword, function (err, isMatch) {
            if (err) {
              callback(null, 'Incorrect password. Please try again', 1101);
              return;
            }
    
            if (!isMatch) {
              callback(null, 'Incorrect password. Please try again', 1101);
              return;
            }
    
            if (oldPassword == newPassword) {
              callback(null, 'New password cannot be the same as old password', 1103);
              return;
            }
    
            user.password = newPassword;
    
            userToken.generateToken(user.password, function (newToken) {
              if (!newToken) {
                callback(null, 'An error occurred while generating the token', 1005);
                return;
              }
    
              userToken.insertToken(newToken, function (insertSuccess) {
                if (!insertSuccess) {
                  callback(null, 'An error occurred while assigning a token.', 1006);
                  return;
                }
    
                user.save(function (saveError) {
                  if (saveError) {
                    callback(null, 'An error occurred while saving changed password.', 1004);
                    return;
                  }
    
                  user.token = newToken;
                  callback(user.toJSON(), 'Successfully Changed Password', 1);
                  return;
                });
              });
            });
          });
        });
      }
}

module.exports = UserDataHandler;