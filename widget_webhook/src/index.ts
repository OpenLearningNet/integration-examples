import express from "express";
import https from "https";
import { sendResponseToOpenLearning } from "./webhookResponse";

const app = express();
const port = 8090;

app.use(express.json());

app.post("/webhook", (req, res) => {
  /*
  Data Format:
  {
    "course": "{OpenLearning Course ID}",
    "token": "{return token to respond with}",
    "returnUrl": "{URL to respond to}",
    "user": "{OpenLearning user ID of the Post author}",
    "url": "{URL of this request}",
    "post": {
      "sourceUrl": "{URL of OpenLearning Page where the action originated}",
      "text": "{Text/reflections authored by the user in the post",
      "sourceBlock": "{OpenLearning Block ID where the action originated (within a page)}",
      "data": {
        // Post Data, depends on Post type. See Below.
      },
      "type": "{ 'html', 'text', 'image', 'video', 'files', or 'attachments', depending on Post type }",
      "id": "{ OpenLearning Post ID }",
      "createdAt": { Seconds Since Epoch of Post Creation }
    },
    "class": "{ OpenLearning Class/Cohort ID }",
    "name": "{ Full Name of Posting User }"
  }

  Post Data Formats:

  type = "html":
  {
    "content": "{HTML Content}"
  }

  type = "text":
  {
    "content": "{Text Content}"
  }

  type = "video":
  {
    "url": "{Video URL}",

    // optional
    "thumnail_url": "{Thumbnail Image URL}",
    "title": "{Video Title}",
    "description": "{Video Description}",
  }

  type = "files":
  {
    "files": [ {
      "url": "{File Download URL}",
      "contentType": "{File mimetype}",
      "filename": "{Filename}",
      "size": "{File Size}
    }, ... ]
  }

  type = "attachments":
  {
    "attachments": [ {
      // Attachment (see below)
    }, ... ]
  }

  Attachment Format:

  {
    "name": "{Attachment Title}",
    "displayType": "{ 'content', 'code-content', 'image-url', 'audio-url', 'video-url', 'embed-url', or 'link-url' }",
    "contentType": "{ Mimetype of the content, or of the resource (if a url type) }",
    "content": "{ Text Content if 'content' or 'code-content', URL(s) otherwise }",
    
    // optional
    "height": 600, // Height hint (for rendering), in pixels
    "caption": "{ Additional text caption (displayed below in OpenLearning) }",
    "meta": {
      // any additional data stored, but not rendered by the attachment
    }
  }

  */


  const data = req.body;

  // tslint:disable-next-line:no-console
  console.log("\nReceived\n", data);

  /*
  e.g.
  const userId = data.user;
  const userFullName = data.name;
  const post = data.post;
  const postType = post.type;
  */

  const token = data.token;
  const returnUrl = data.returnUrl;

  sendResponseToOpenLearning(returnUrl, {
    token,
    timestamp: Date.now(),
    status: 'success',
    text: {
      value: 'This is a test'
    }
  });

  res.send('Done');
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
