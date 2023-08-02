// Imports
require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");

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
    const credentials = {
        key: privateKey,
        cert: certificate
    };

    httpsServer = https.createServer(app, credentials);
    httpsServer.listen(443, () => {
        console.log("HTTPS server online")
    });

    sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));
app.use(express.json());
app.use("/.well-known", express.static(process.cwd() + "/public/well-known"));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/public/index.html");
})