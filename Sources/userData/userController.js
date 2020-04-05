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
  
      req.body.password = methods.dataDecrypt(req,req.body.password)
      const password = sanitize(req.body.password);
    
      const username = sanitize(req.body.username);
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
  

module.exports = {
    createUser,
    login,
    logout
}