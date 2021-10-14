import lti from "ims-lti";
import path from "path";
import express, { Request } from "express";
import { URL } from "url";

const DEMO_CONSUMER_KEY = "testingkey";
const DEMO_CONSUMER_SECRET = "testingsecret";

const PROXY_LAUNCH_URL = 'https://example.ngrok.io/lti';

const overrideRequestUrl = (req: Request) => {
  // If testing through a proxy, e.g. Ngrok
  // the following need to be overwritten

  const launchUrl = new URL(PROXY_LAUNCH_URL);
  const protocol = launchUrl.protocol.replace(':', '');
  const host = launchUrl.host;
  const path = launchUrl.pathname;

  req.originalUrl = `${protocol}://${host}${path}`;
  req.headers.host = host;
  console.log(protocol, host, path);

  Object.defineProperty(req, 'protocol', {
    get: function() {
      return protocol;
    }
  });
};

const provider = new lti.Provider(DEMO_CONSUMER_KEY, DEMO_CONSUMER_SECRET);
const app = express();
const port = 8080;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.post("/lti", (req, res) => {
  
  if (PROXY_LAUNCH_URL) {
    overrideRequestUrl(req);
  }

  provider.valid_request(req, (error: Error, isValid: boolean) => {
    if (isValid) {
      const params = req.body;
      res.render("index", { params });
    } else {
      console.log(error);
      res.render("error");
    }
  });
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
