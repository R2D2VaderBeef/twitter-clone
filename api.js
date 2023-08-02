const express = require('express')
const router = express.Router()

router.get('/user', (req, res) => {
    if (req.session.loggedin) {
        res.send({ handle: req.session.handle });
    }
    else res.send({ handle: null });
})

module.exports = router