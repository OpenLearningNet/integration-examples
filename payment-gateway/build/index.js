"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApYBynppiS0xvQcNRcVQM
QQvM3j5gCg2h9z5Rg0Vf3vedQg/MiS77CFXgYl4e8CP3PkTiSAManUiaPJ+tWkp1
WxtnsEek4l2AcW3yuliiLT8zxOD18P8umdOtoqICVvrokI+ChsjQrhhFGRvh7F3r
+400ztaT2PFCmA1EvBZPObNhnMqmO4B6Jz8eQGlsjRzNYaCsntONKZdqrG21ocgi
epCxohRboCBPQ5NU8owRY5uxPuAfDA1pNmzSN0Kiy3FE2Nr4DGnp6Q1Y5IIpQLeL
3ruQjBWlKbh/2wULi/TrKASjbtVl5MP4NSqruum0Dpg0tSCirk8ATM3pi63bcRpK
qwIDAQAB
-----END PUBLIC KEY-----`;
const SECRET = `this-is-a-secret-key`;
const ENROLMENT_API = "https://api.openlearning.com/v2.1/enrolments/";
const API_KEY = "4ee2ca48e694aa284f0000b3.a0aaa73b2ea4172ca6868d59fdcf0049ee1d9ba963956146f97848707040b84c";
const app = (0, express_1.default)();
const port = 5678;
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("This is an example payment gateway server.");
});
app.post("/enrol", (req, res) => {
    console.log("Enrol request received.");
    const token = req.body.jwt;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, PUBLIC_KEY);
        if (typeof decoded === "string") {
            // JWT invalid
            console.log("Invalid: " + decoded);
            res.sendStatus(401);
        }
        else {
            // Create a new token for this form
            const auth = jsonwebtoken_1.default.sign({
                jti: decoded.jti,
                sub: decoded.sub,
                class: decoded.class,
                redirect_url: decoded.redirect_url,
            }, SECRET);
            console.log("Showing form");
            // Show an enrolment form here
            res.send(`
      <p>Enrol request received for class ${decoded.class} by user ${decoded.sub}.</p>
      <p>This form just requires a challenge, but would normally validate payment instead.</p>
      <form action="/complete" method="post">
        <input type="hidden" name="token" value="${auth}"/>
        <input type="text" name="challenge" placeholder="Challenge"/>
        <input type="submit" value="Enrol"/>
      </form>
    `);
        }
    }
    catch (err) {
        // JWT invalid
        console.log("Invalid: " + err);
        res.sendStatus(401);
    }
});
app.post("/complete", (req, res) => {
    console.log("Enrolment complete request received.");
    const token = req.body.token;
    const challenge = req.body.challenge;
    if (challenge !== "swordfish") {
        // validate the challenge (e.g. verify payment was successful)
        res.send(`Invalid challenge`);
    }
    else {
        // Validation of challenge was successful, enrol the user
        try {
            // validate the auth token
            const decoded = jsonwebtoken_1.default.verify(token, SECRET);
            if (typeof decoded === "string") {
                // JWT invalid
                console.log("Invalid: " + decoded);
                res.sendStatus(401);
            }
            else {
                // make a request to API to enrol user
                console.log(`Making request to API to enrol the user: class=${decoded.class}&user=${decoded.sub}`);
                const responsePromise = (0, node_fetch_1.default)(ENROLMENT_API, {
                    method: "POST",
                    headers: {
                        "X-API-KEY": API_KEY,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    },
                    body: `class=${decoded.class}&user=${decoded.sub}`
                });
                responsePromise.then((response) => {
                    if (response.status === 200) {
                        // Enrolment successful
                        // Redirect to class page
                        res.redirect(decoded.redirect_url);
                    }
                    else {
                        // Enrolment failed
                        console.log(response);
                        res.send(`
              <p>Enrolment failed for class ${decoded.class} by user ${decoded.sub}.</p>
            `);
                    }
                });
            }
        }
        catch (err) {
            // JWT invalid
            console.log("Invalid: " + err);
            res.sendStatus(401);
        }
    }
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
