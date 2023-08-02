const express = require('express');
const router = express.Router();
const { getAllUsers, addNewUser, getUser, setUserBio, saveNewPoop, getPoop, likePoop, saveNewPoopWithAction, getRecentPoops } = require("./database.js");
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
    let handle = req.body.handle.slice(0, 16).toLowerCase();
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
            res.send({ "error": "nouser" })
        }
        else {
            if (result[0].bio) bio = result[0].bio;
            res.send({ "handle": handle, "self": self, "bio": bio });
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

    if (req.body.action == "poop") {
        saveNewPoop(handle, poop, timestamp).then(result => {
            res.send("success " + result[0]["LAST_INSERT_ID()"].toString());
        })
    }
    else if (req.body.action == "fartback" || req.body.action == "smear") {
        saveNewPoopWithAction(handle, poop, timestamp, req.body.action, req.body.related_id).then(result => {
            res.send("success " + result[0]["LAST_INSERT_ID()"].toString());
        })
    }
})

router.get("/getPoop", (req, res) => {
    let id = req.query.id;

    getPoop(id).then(result => {
        if (!result[0]) {
            res.send([{ "error": "nopoop" }])
        }
        else {
            res.send([result[0], { "handle": req.session.handle }]);
        }
    })
})

router.post("/likePoop", (req, res) => {
    if (!req.session.loggedin) return res.status(401).send("login");
    let id = req.body.id;
    let handle = req.session.handle;

    likePoop(id, handle).then(result => {
        res.send("success " + result.toString());
    })
})

router.get("/getPoopAuthor", (req, res) => {
    let id = req.query.id;
    getPoop(id).then(result => {
        if (!result[0]) {
            res.send("")
        }
        else {
            res.send(result[0].handle);
        }
    })
})

router.get("/getSewerPosts", (req, res) => {
    let number = parseInt(req.query.number);
    let page = parseInt(req.query.page);

    if (number > 0 && page > 0) {
        getRecentPoops(number, page).then(result => {
            result[number] = { "handle": req.session.handle }
            res.send(result);
        })
    }
    else res.end();
})

module.exports = router