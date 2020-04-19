const {verify}  = require('jsonwebtoken');


const isAuth = req => {
    const authorization= req.headers['authorization'];
    if(!authorization) {
        throw new Error ('You need to Login');
    }
    const token = authorization

    const userId = verify(token, ACCESS_TOKKEN_SECRET);
    console.log(userId);
    return userId;
}

module.exports  = {
    isAuth: isAuth
}