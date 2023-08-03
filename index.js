// Imports
require("dotenv").config();
const fs = require("fs")
const express = require("express");
const app = express();
const session = require("express-session");
const api = require(process.cwd() + "/api.js");
const db = require(process.cwd() + "/database.js");

const http = require("http");
const https = require("https");

const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 80, () => {
    console.log("HTTP server online")
});

let sessionOptions = {
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {}
}

let httpsServer;
if (process.env.PROD == "true") {
    const privateKey = fs.readFileSync(process.env.SSL_PRIVATEKEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, 'utf8');
    const ca = fs.readFileSync(process.env.SSL_CA_PATH, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    httpsServer = https.createServer(app, credentials);
    httpsServer.listen(443, () => {
        console.log("HTTPS server online")
    });

    sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));
app.use(express.json());

app.use(function (req, res, next) {
    if (!req.secure && process.env.PROD == "TRUE") {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

app.use("/.well-known", express.static(process.cwd() + "/public/.well-known"));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
})

app.get("/signup", (req, res) => {
    res.sendFile(process.cwd() + "/public/signup.html");
})

app.get("/login", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/")
    }
    else res.sendFile(process.cwd() + "/public/login.html");
})

app.get("/logout", (req, res) => {
    if (req.session.loggedin) {
        req.session.destroy(function() {
            res.redirect("/");
        })
    }
    else res.redirect("/");
})

app.get("/tissue", (req, res) => {
    res.sendFile(process.cwd() + "/public/tissue.html");
})

app.get("/my-tissue", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/tissue?handle=" + req.session.handle);
    }
    else res.redirect("/login")
})

app.get("/poop", (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(process.cwd() + "/public/poop.html");
    }
    else res.redirect("/login")
})

app.get("/poops", (req, res) => {
    res.sendFile(process.cwd() + "/public/poopviewer.html");
})

app.get("/sewer", (req, res) => {
    res.sendFile(process.cwd() + "/public/sewer.html");
})

app.use("/css", express.static(process.cwd() + "/public/css"));
app.use("/fonts", express.static(process.cwd() + "/public/fonts"));
app.use("/js", express.static(process.cwd() + "/public/js"));
app.use("/.well-known", express.static(process.cwd() + "/public/.well-known"));
app.use("/api", api)