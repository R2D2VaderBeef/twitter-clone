const express = require('express');
const router = express.Router();
const { getAllUsers, addNewUser, getUser } = require("./database.js");
const crypto = require('crypto'); 

router.get('/user', (req, res) => {
    if (req.session.loggedin) {
        res.send({ handle: req.session.handle });
    }
    else res.send({ handle: null });
})

router.get('/getAllUsers', (req, res) => {
    getAllUsers().then(result => {
        let handles = []
        for (let i = 0; i < result.length; i++) {
            handles[i] = result[i].handle;
        }
        res.send(handles);
    })
})

router.post("/signup", (req, res) => {
    let handle = req.body.handle;
    let password = req.body.password;

    let salt = crypto.randomBytes(16).toString('hex');
    let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    addNewUser(handle, salt, hash).then(result => {
        res.send("success " + handle);
    }).catch(err => {
        res.send("error " + err);
    })
})

router.post("/login", (req, res) => {
    let handle = req.body.handle;
    let password = req.body.password;
    
    getUser(handle).then(result => {
        if (!result[0]) {
            res.send("error nouser")
        }
        else {
            let salt = result[0].salt;
            let checkhash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            if (checkhash == result[0].hash) {
                req.session.loggedin = true;
                req.session.handle = result[0].handle;
                res.send("success " + result[0].handle);
            }
        }
    })
})

module.exports = router