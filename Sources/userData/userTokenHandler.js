const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const random = require('random');
// Used to avoid some warning
mongoose.set('useCreateIndex', true);

// Maximum possible caller id value (2 billion)
const MAX_RANDOM_VALUE = 2000000000;
class UserTokenHandler {
  constructor(dbModel, user) {
    this.user = user;
    this.dbModel = dbModel;
  }

  _isDict(data) {
    return typeof data === 'object' && data !== null && !(data instanceof Array) && !(data instanceof Date);
  }

  generateToken(passwordKey, callback) {
    const user = this.user == null ? {} : this.user;
    const uid = user.uid == null ? '384f8ru38924' : user.uid;
    const encryptedToken = passwordKey;
    const randomValue = random.int(100, MAX_RANDOM_VALUE);
    const privateKey = uid + '02AC684385740FE7A311C8CEAA06CFE906CA8851CBA71C2DCACD06C56E47993A' + `${randomValue}`;
    jwt.sign({ encryptedToken }, privateKey, (err, token) => {
      if (!err) {
        callback(token, 'Successful Operation');
      } else if (err) {
        callback(null, 'Failed Operation');
        return;
      }
    });
  }

  insertToken(tokenData, callback) {
    const user = this.user;
    const createdTimestamp = Date.now();
    let tokenInfoData = { createdTimestamp: createdTimestamp, logoutTimestamp: null };

    if (this._isDict(tokenData)) {
      tokenInfoData = Object.assign(tokenInfoData, tokenData);
    } else {
      tokenInfoData['token'] = tokenData;
    }

    if (user.tokenInfo.length >= 5) {
      user.tokenInfo.shift();
    }

    user.tokenInfo.push(tokenInfoData);
    user.save(function (err) {
      if (err) {
        callback(false, 'Failed Operation');
        return;
      }
      callback(true, 'Successful Operation');
    });
  }

  invalidateToken(token, callback) {
    const user = this.user;
    const tokenInfo = user.tokenInfo;
    let isTokenFound = false;
    for (let i = 0; i < tokenInfo.length; i++) {
      const tokenObject = tokenInfo[i];
      if (tokenObject.token == token) {
        isTokenFound = true;
        user.tokenInfo[i].token = null;
        user.tokenInfo[i].logoutTimestamp = Date.now();
        user.save();
        break;
      }
    }
    if (isTokenFound == false) {
      callback(false, "Invalid_Token", 1007);
    } else {
      callback(true, 'Successful Operation', 1);
    }
  }
  
  validateTokenDevice(token, callback) {
    const user = this.user;
    const tokenInfo = user.tokenInfo;
    var isTokenFound = false;
    for (let i = 0; i < tokenInfo.length; i++) {
      const tokenObject = tokenInfo[i];
      if (tokenObject.token == token) {
        isTokenFound = true;
        break;
      }
    }
      if (isTokenFound == false) {
        callback(null, "Invalid_Token", 1007);
      } else {
        callback(user, 'Successful Operation');
      }
  }
  validateToken(userID, token, callback) {
    if (token == null || userID == null || token == '' || userID == '') {
      callback(null, 'Missing token or userid', 1100);
      return;
    }
    this.dbModel.findOne({ 'uid': userID }, { '__v': 0 }, function (err, user) {
      if (err) {
        callback(null, 'Error has occured', 1004);
        return;
      }
      if (!user) {
        callback(null, 'User does not exist', 1102);
        return;
      } else {
        const tokenInfo = user.tokenInfo;
        let isTokenFound = false;
        for (let i = 0; i < tokenInfo.length; i++) {
          const tokenObject = tokenInfo[i];
          if (tokenObject.token == token) {
            isTokenFound = true;
            break;
          }
        }
        if (!isTokenFound) {
          callback(null, "Invalid_Token", 1007);
        } else {
          callback(user, 'Successful Operation');
        }
      }
    });
  }
}

module.exports = UserTokenHandler;