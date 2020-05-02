const UserDataHandler = require('./userDataHandler');
const methods = require('../../Resources/helperFunctions');
const sanitize = require('mongo-sanitize');

const createUser = function(req, res) {
    req.body.password = methods.dataDecrypt(req,req.body.password)
    if (req.method == 'POST') {
        const verifyVersionId = methods.versionIdVerify(req);
        if (verifyVersionId != null) {
            return res.json(verifyVersionId);
        }
        const isValid = methods.validateUserInfo(req.body);

        if (isValid[0] == false) {
        const jsonResponse = methods.invalidQueryResponse(isValid[1]);
        jsonResponse.status.code = 1101;
        res.status(400);
        return res.json(jsonResponse);
        }
        
        const newUser = new UserDataHandler('');
        newUser.createUser(req.body, (user, message, responseCode) => {
            if (user == null) {
              const jsonResponse = methods.invalidQueryResponse(message);
              jsonResponse.status.code = responseCode;
              res.status(400);
              return res.json(jsonResponse);
            }
            return res.json(
                methods.validQueryResponse(message, user)
            );
          });
    } else {
        const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
        jsonResponse.status.code = 2000;
        res.status(500);
        return res.json(jsonResponse);
    }
}

const login = function(req, res) {
    if (req.method == 'POST') {
      const versionIdMatch = methods.versionIdVerify(req);
      if (versionIdMatch != null) {
        return res.json(versionIdMatch);
      }
      const password = sanitize(req.body.password);
    
      const username = sanitize(req.body.username);
      if (username == '' || password == '') {
        const jsonResponse = methods.invalidQueryResponse('Missing input');
        return res.json(jsonResponse);
      }
      req.body.password = methods.dataDecrypt(req,req.body.password)
      const newUser = new UserDataHandler('');
      newUser.logIn(username, password, (user, message, responseCode) => {
        if (user == null) {
          const jsonResponse = methods.invalidQueryResponse(message);
          jsonResponse.status.code = responseCode;
          res.status(400);
          return res.json(jsonResponse);
        } else {
          return res.json(
              methods.validQueryResponse(message, user)
          );
        }
      });
    } else {
      const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
      jsonResponse.status.code = 2000;
      res.status(500);
      return res.json(jsonResponse);
    }
}

const logout = function(req, res) {
    if (req.method == 'POST') {
      const versionIdMatch = methods.versionIdVerify(req);
      if (versionIdMatch != null) {
        return res.json(versionIdMatch);
      }
  
      const userID = sanitize(req.headers.uid);
      const token = sanitize(req.headers.token);
      if (userID == '' || token == '') {
        const jsonResponse = methods.invalidQueryResponse('Missing input');
        return res.json(jsonResponse);
      }
      const newUser = new UserDataHandler();
      newUser.logoutUser(userID, token, (didLogout, message, responseCode) => {
        if (!didLogout || responseCode != 1) {
          const jsonResponse = methods.invalidQueryResponse(message);
          jsonResponse.status.code = responseCode;
          res.status(400);
          return res.json(jsonResponse);
        } else {
          const jsonResponse = methods.validQueryResponse(message, didLogout);
          jsonResponse.user = undefined;
          jsonResponse.didLogout = didLogout;
          res.status(400);
          return res.json(jsonResponse);
        }
      });
    } else {
      const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
      jsonResponse.status.code = 2000;
      res.status(500);
      return res.json(jsonResponse);
    }
}

const verifyPhoneCode = function(req, res) {
  if (req.method == 'POST') {
    const versionIdMatch = methods.versionIdVerify(req);
    if (versionIdMatch != null) {
      return res.json(versionIdMatch);
    }

    const userID = sanitize(req.headers.uid);
    const token = sanitize(req.headers.token);
    const code = sanitize(req.body.code);
    if (userID == '' || token == '' || code == '') {
      const jsonResponse = methods.invalidQueryResponse('Missing input');
      return res.json(jsonResponse);
    }
    const newUser = new UserDataHandler();
    newUser.verifyPhoneCode(userID, token, code, (isVerified, message, responseCode) => {
      if (!isVerified) {
        const jsonResponse = methods.invalidQueryResponse(message);
        jsonResponse.status.code = responseCode;
        res.status(400);
        return res.json(jsonResponse);
      } else {
        const jsonResponse = methods.validQueryResponse(message, isVerified);
        jsonResponse.user = undefined;
        jsonResponse.isVerified = isVerified;
        res.status(400);
        return res.json(jsonResponse);
      }
    });
  } else {
    const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
    jsonResponse.status.code = 2000;
    res.status(500);
    return res.json(jsonResponse);
  }
}
  

const editUser = function(req, res) {
  if (req.method == 'POST') {
    const versionIdMatch = methods.versionIdVerify(req);
    if (versionIdMatch != null) {
      return res.json(versionIdMatch);
    }

    const userID = sanitize(req.headers.uid);
    const token = sanitize(req.headers.token);
    const editedInfo = sanitize(req.body.editedInfo);
    if (userID == '' || token == '' || Object.keys(editedInfo).length == 0) {
      const jsonResponse = methods.invalidQueryResponse('Missing input');
      return res.json(jsonResponse);
    }
    const newUser = new UserDataHandler();
    newUser.editUser(editedInfo, userID, token, (isEdited, message, responseCode) => {
      if (!isEdited) {
        const jsonResponse = methods.invalidQueryResponse(message);
        jsonResponse.status.code = responseCode;
        res.status(400);
        return res.json(jsonResponse);
      } else {
        const jsonResponse = methods.validQueryResponse(message, isEdited);
        jsonResponse.user = undefined;
        jsonResponse.isVerified = isEdited;
        res.status(400);
        return res.json(jsonResponse);
      }
    });
  } else {
    const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
    jsonResponse.status.code = 2000;
    res.status(500);
    return res.json(jsonResponse);
  }
}

const changePassword = function(req, res) {
  if (req.method == 'POST') {
    const versionIdMatch = methods.versionIdVerify(req);
    if (versionIdMatch != null) {
      return res.json(versionIdMatch);
    }

    const userID = sanitize(req.headers.uid);
    const token = sanitize(req.headers.token);
    const oldPassword = sanitize(req.body.oldPassword);
    const newPassword = sanitize(req.body.newPassword);
    if (userID == '' || token == '' || oldPassword == '' || newPassword == '') {
      const jsonResponse = methods.invalidQueryResponse('Missing input');
      return res.json(jsonResponse);
    }
    const newUser = new UserDataHandler();
    newUser.changePassword(userID, oldPassword, newPassword, token, (isChanged, message, responseCode) => {
      if (!isChanged) {
        const jsonResponse = methods.invalidQueryResponse(message);
        jsonResponse.status.code = responseCode;
        res.status(400);
        return res.json(jsonResponse);
      } else {
        const jsonResponse = methods.validQueryResponse(message, isChanged);
        jsonResponse.user = undefined;
        jsonResponse.isVerified = isChanged;
        res.status(400);
        return res.json(jsonResponse);
      }
    });
  } else {
    const jsonResponse = methods.invalidQueryResponse('Invalid HTTP Request');
    jsonResponse.status.code = 2000;
    res.status(500);
    return res.json(jsonResponse);
  }
}

module.exports = {
    createUser,
    login,
    logout,
    verifyPhoneCode,
    editUser,
    changePassword
}