import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
PUT YOUR PUBLIC KEY (from the Course Setup UI) HERE
-----END PUBLIC KEY-----`;

const SECRET = `replace-this-with-a-secret-key`;

const ENROLMENT_API = "https://api.openlearning.com/v2.1/enrolments/";
const API_KEY = "your-api-key-here";

const app = express();
const port = 5678;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("This is an example payment gateway server.");
});

app.post("/enrol", (req: Request, res: Response) => {
  console.log("Enrol request received.");
  const token = req.body.jwt;

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY) as jwt.JwtPayload;

    // Create a new token for this form
    const auth = jwt.sign(
      {
        jti: decoded.jti,
        sub: decoded.sub,
        class: decoded.class,
        redirect_url: decoded.redirect_url,
      },
      SECRET
    );
    console.log("Showing form");

    // Show a form to collect user payment etc.
    res.send(`
      <p>Enrol request received for class ${decoded.class} by user ${decoded.sub}.</p>
      <p>This form just requires a challenge, but would normally validate payment instead.</p>
      <form action="/complete" method="post">
        <input type="hidden" name="token" value="${auth}"/>
        <input type="text" name="challenge" placeholder="Challenge"/>
        <input type="submit" value="Enrol"/>
      </form>
    `);
  } catch (err) {
    // JWT invalid
    console.log("Invalid: " + err);
    res.sendStatus(401);
  }
});

app.post("/complete", (req: Request, res: Response) => {
  console.log("Enrolment complete request received.");
  const token = req.body.token;
  const challenge = req.body.challenge;

  if (challenge !== "swordfish") {
    // validate the challenge (e.g. verify payment was successful)
    res.send(`Invalid challenge`);
  } else {
    // Validation of challenge was successful, enrol the user
    try {
      // validate the auth token
      const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;

      // make a request to API to enrol user
      console.log(
        `Making request to API to enrol the user: class=${decoded.class}&user=${decoded.sub}`
      );

      const responsePromise = fetch(ENROLMENT_API, {
        method: "POST",
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: `class=${decoded.class}&user=${decoded.sub}`,
      });

      responsePromise.then((response) => {
        if (response.status === 200) {
          // Enrolment successful, redirect to the class page
          res.redirect(decoded.redirect_url);
        } else {
          // Enrolment failed, show an error
          console.log(response);
          res.send(`
              <p>Enrolment failed for class ${decoded.class} by user ${decoded.sub}.</p>
            `);
        }
      });
    } catch (err) {
      // JWT invalid
      console.log("Invalid: " + err);
      res.sendStatus(401);
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
