const {sign} = require('jsonwebtoken');

const createAccessTokken = userId => {
    return sign({user: userId}, ACCESS_TOKKEN_SECRET, {
        expiresIn: '15m'
    });
}

const createRefreshTokken = userId => {
    return sign({user: userId}, REFRESH_TOKKEN_SECRET, {
        expiresIn: '7d'
    });
}

const sendAccessTokken = (req, res, accessTokken) => {
    res.send({
        email: req.body.email,
        accessTokken: accessTokken,
    });
}

const sendRefreshTokken = (res, refreshTokken) => {
    res.cookie('refreshTokken', refreshTokken, {
        httpOnly: true,
        path: '/refresh_token'
    });
}

module.exports = {
    createAccessTokken:createAccessTokken,
    createRefreshTokken:createRefreshTokken,
    sendAccessTokken:sendAccessTokken,
    sendRefreshTokken:sendRefreshTokken,
}