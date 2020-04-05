const sanitize = require('mongo-sanitize');

const versionID = {
    '0.1': ['THE_EAR_2020', 'EAR_OVER_EVERYTHING', 'EGD2_PROJECT']
};


const versionIdVerify = function(req) {
    const version = req.headers['x-theear-api-version'];
    const ID = req.headers['x-theear-api-id'];
    const invalidResponse = {
        'status': {
            'code': 1101,
            'title': 'Invalid Operation',
            'message': 'Invalid API key'
        },
    };

    if (!versionID[version]) {
        return invalidResponse;
    }

    if (versionID[version].includes(ID)) {
        return null;
    } else {
        return invalidResponse;
    };
}

const invalidQueryResponse = function(message) {
    let responseMessage = message;
    if (typeof message != 'string') {
        responseMessage = 'Error: ' + message;
    }

    return {
        status: {
            code: 1004,
            title: 'Invalid Operation',
            message: responseMessage
        },
    }
}

const validQueryResponse = function(message, user) {
    let responseMessage = message;
    if (typeof message != 'string') {
        responseMessage = 'Error: ' + message;
    }

    return {
        status: {
            code: 200,
            title: 'Success',
            message: responseMessage
        },
        user: user,
    }
}

const dataEncrypt = (req,data) => {
    if (req.headers['x-theear-api-version'] > 0.1) {
      const key = '12345678910' // store this key in secure place
      const encryptor = new Encryptor({ key, encryptionCount: 5 })
      const encryptedData = encryptor.encrypt(data)
      return encryptedData
    } else {
      return data
    }
  }
  
  const dataDecrypt = (req,data) => {
    if (req.headers['x-theear-api-version'] > 0.1) {
      const key = '12345678910' // store this key in secure place
      const decryptor = new Decryptor({ key, encryptionCount: 5 })
      return decryptor.decrypt(data)
    } else {
      return data
    }
  }

  const validateUserInfo = function (inputDict) {
    if (!inputDict) {
      return [false, 'Missing input values'];
    }
  
    requestLength = Object.keys(inputDict).length;
    if (requestLength < 1 || inputDict.username == undefined) {
      return [false, 'Missing username'];
    }
    const username = sanitize(inputDict.username.toLowerCase());
    const format = /[ !@#$%^&*()+\-=\[\]{};':"\\|,<>\/?]/;
    const boolSymbol = format.test(username);
  
    if (boolSymbol == true) {
      return [false, 'Invalid character'];
    } else if (username.length < 4 || username.length > 15) {
      return [false, 'Invalid length. Username must be between 4 to 15 characters'];
    } else {
      return [true, 'Perfect'];
    }
  };
  
  const validateUserPassword = function (password) {
    if (/ \s/g.test(password) || password == undefined) {
      return [false, 'Invalid Password'];
    } else {
      return [true, 'Valid Password'];
    }
  };
module.exports = {
    versionIdVerify,
    invalidQueryResponse, 
    validQueryResponse,
    dataEncrypt,
    dataDecrypt,
    validateUserInfo,
    validateUserPassword
}