const express = require('express');
const cookieParser = require('cookie-parser');
const { hash, compare } = require('bcryptjs');
const { verify } = require('jsonwebtoken');
const { fakeDb } = require('./fakeDb.js');
const server = express();
const { isAuth } = require('./isAuth.js');
const { createAccessTokken, createRefreshTokken, sendAccessTokken, sendRefreshTokken } = require('./tokken.js');
require('../config.js');
//set middleware 

server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));


server.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = fakeDb.find(user => user.email === email);
        //User Already Exists
        if (user) throw new Error('User Already Exist')
        //Hash Password
        const hashPassword = await hash(password, 10);
        console.log(hashPassword);
        //Push User Into fakeDB
        fakeDb.push({
            id: fakeDb.length,
            email,
            password: hashPassword
        });
        res.send({ 'message': 'User Created' });
        console.log(fakeDb);
    } catch (error) {
        res.send({ error: `${error.message}` });
    }
});

server.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = fakeDb.find(user => user.email === email);
        if (!user) {
            throw new Error('User not found');
        }
        const valid = await compare(password, user.password);
        if (!valid) {
            throw new Error('Password not correct ');
        }
        const AccessTokken = createAccessTokken(user.id);
        const RefreshTokken = createRefreshTokken(user.id);
        //put refresh tokken Into fakeDb
        user.RefreshTokken = RefreshTokken;
        //send tokken: refresh tokken as cookie accestokken as regurlar  expression
        sendRefreshTokken(res, RefreshTokken);
        sendAccessTokken(req, res, AccessTokken);
        console.log(fakeDb);
    } catch (error) {
        res.send({
            error: `${error.message}`
        });
    }
});

server.post('/logout', (req, res) => {
    res.clearCookie('refreshTokken', {path: '/refresh_token' });
    return res.send({
        message: 'logout'
    })
});

server.post('/protected', async (req, res) => {

    try {
        const userId = isAuth(req);
        if (userId != null) {
            res.send({
                message: 'Data is protected'
            });
        }
    } catch (error) {
        res.send({
            error: `${error.message}`
        });
    }
});

server.post('/refreshtokken', (req, res) => {
    const token = req.cookies.RefreshTokken
    if (!token) {
        res.send({ 'access_token': '' })
    }
    let payload = null;
    try {
        payload = verify(token, REFRESH_TOKKEN_SECRET);
    } catch (error) {
        res.send({
            'access_tokken': ''
        });
    }
    let user = fakeDb.find(user => user.id === payload.userId);
    if (!user) {
        res.send({ 'access_token': '' })
    }
    if (user.RefreshTokken !== token) {
        res.send({
            'access_tokken': ''
        });
    }
    const AccessTokken = createAccessTokken(user.id);
    const RefreshTokken = createRefreshTokken(user.id);

    user.RefreshTokken = RefreshTokken;
    sendRefreshTokken(res, RefreshTokken);
    res.send({ access_token: AccessTokken });
});
server.listen(PORT, () =>
    console.log(`Server listening to ${PORT}`),
);