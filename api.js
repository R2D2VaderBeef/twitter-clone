const express = require('express');
const router = express.Router();
const { getAllUsers, addNewUser, getUser, setUserBio, saveNewPoop } = require("./database.js");
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
    let handle = req.body.handle.slice(0, 16);
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

router.get("/getProfile", (req, res) => {
    let handle = req.query.handle;
    let self = handle == req.session.handle ? true : false;
    let bio = "";

    getUser(handle).then(result => {
        if (!result[0]) {
            res.send({"error": "nouser"})
        }
        else {
            if (result[0].bio) bio = result[0].bio;
            res.send({"handle": handle, "self": self, "bio": bio});
        }
    })
})

router.post("/setBio", (req, res) => {
    if (!req.session.loggedin) return res.end(401);
    let handle = req.session.handle;
    let newbio = req.body.newbio.slice(0, 200);
    newbio = newbio.replaceAll("<", "").replaceAll(">", "");

    setUserBio(handle, newbio).then(result => {
        res.send("success");
    })
})

router.post("/newPoop", (req, res) => {
    if (!req.session.loggedin) return res.end(401);
    let handle = req.session.handle;
    let poop = req.body.poop.slice(0, 300);;
    poop = poop.replaceAll("<", "").replaceAll(">", "");
    let timestamp = Date.now();

    saveNewPoop(handle, poop, timestamp).then(result => {
        res.send("success " + result[0]["LAST_INSERT_ID()"].toString());
    })
})

module.exports = router